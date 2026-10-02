/**
 * Small FLIP/PIC hybrid fluid solver on a MAC grid (after Müller's
 * "Ten Minute Physics" FLIP formulation). Units are abstract: the tank is
 * `height` tall and gravity acts along -y.
 */

const FLUID = 0;
const AIR = 1;
const SOLID = 2;

export type FluidStepOptions = {
  dt: number;
  gravity: number;
  /** Sideways gravity used for idle sloshing. */
  gravityX: number;
  flipRatio: number;
  pressureIters: number;
  separationIters: number;
  overRelaxation: number;
  obstacle: { x: number; y: number; vx: number; vy: number; radius: number; active: boolean };
};

export class FlipFluid {
  readonly h: number;
  readonly numX: number;
  readonly numY: number;
  readonly invSpacing: number;
  readonly particleRadius: number;
  numParticles = 0;
  restDensity = 0;

  private readonly u: Float32Array;
  private readonly v: Float32Array;
  private readonly du: Float32Array;
  private readonly dv: Float32Array;
  private readonly prevU: Float32Array;
  private readonly prevV: Float32Array;
  private readonly s: Float32Array;
  private readonly cellType: Int32Array;
  readonly density: Float32Array;

  readonly pos: Float32Array;
  private readonly vel: Float32Array;

  private readonly pInvSpacing: number;
  private readonly pNumX: number;
  private readonly pNumY: number;
  private readonly cellCount: Int32Array;
  private readonly firstCell: Int32Array;
  private readonly cellIds: Int32Array;

  constructor(width: number, height: number, spacing: number, maxParticles: number) {
    this.numX = Math.floor(width / spacing) + 1;
    this.numY = Math.floor(height / spacing) + 1;
    this.h = Math.max(width / this.numX, height / this.numY);
    this.invSpacing = 1 / this.h;
    const cells = this.numX * this.numY;
    this.u = new Float32Array(cells);
    this.v = new Float32Array(cells);
    this.du = new Float32Array(cells);
    this.dv = new Float32Array(cells);
    this.prevU = new Float32Array(cells);
    this.prevV = new Float32Array(cells);
    this.s = new Float32Array(cells);
    this.cellType = new Int32Array(cells);
    this.density = new Float32Array(cells);

    // Solid walls left, right and floor; the top stays open.
    for (let i = 0; i < this.numX; i++) {
      for (let j = 0; j < this.numY; j++) {
        this.s[i * this.numY + j] = i === 0 || i === this.numX - 1 || j === 0 ? 0 : 1;
      }
    }

    this.particleRadius = 0.3 * this.h;
    this.pos = new Float32Array(2 * maxParticles);
    this.vel = new Float32Array(2 * maxParticles);
    this.pInvSpacing = 1 / (2.2 * this.particleRadius);
    this.pNumX = Math.floor(width * this.pInvSpacing) + 1;
    this.pNumY = Math.floor(height * this.pInvSpacing) + 1;
    const pCells = this.pNumX * this.pNumY;
    this.cellCount = new Int32Array(pCells);
    this.firstCell = new Int32Array(pCells + 1);
    this.cellIds = new Int32Array(maxParticles);
  }

  /** Fills the lower part of the tank with hex-packed particles. */
  fill(width: number, fillHeight: number): void {
    const r = this.particleRadius;
    const dx = 2 * r;
    const dy = (Math.sqrt(3) / 2) * dx;
    const cols = Math.floor((width - 2 * this.h - 2 * r) / dx);
    const rows = Math.floor((fillHeight - 2 * r) / dy);
    const max = this.pos.length / 2;
    let p = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows && p < max; j++) {
        this.pos[2 * p] = this.h + r + dx * i + (j % 2 === 0 ? 0 : r);
        this.pos[2 * p + 1] = this.h + r + dy * j;
        p++;
      }
    }
    this.numParticles = p;
  }

  step(o: FluidStepOptions): void {
    this.integrate(o.dt, o.gravityX, o.gravity);
    this.pushApart(o.separationIters);
    this.collide(o.obstacle);
    this.transfer(true, o.flipRatio);
    this.updateDensity();
    this.solve(o.pressureIters, o.overRelaxation);
    this.transfer(false, o.flipRatio);
  }

  private integrate(dt: number, gx: number, gy: number): void {
    for (let i = 0; i < this.numParticles; i++) {
      this.vel[2 * i]! += dt * gx;
      this.vel[2 * i + 1]! += dt * gy;
      this.pos[2 * i]! += this.vel[2 * i]! * dt;
      this.pos[2 * i + 1]! += this.vel[2 * i + 1]! * dt;
    }
  }

  private pushApart(iters: number): void {
    const { pNumX, pNumY, pInvSpacing, cellCount, firstCell, cellIds, pos } = this;
    const pCells = pNumX * pNumY;
    cellCount.fill(0);
    const cellOf = (i: number): number => {
      const xi = Math.min(Math.max(Math.floor(pos[2 * i]! * pInvSpacing), 0), pNumX - 1);
      const yi = Math.min(Math.max(Math.floor(pos[2 * i + 1]! * pInvSpacing), 0), pNumY - 1);
      return xi * pNumY + yi;
    };
    for (let i = 0; i < this.numParticles; i++) cellCount[cellOf(i)]!++;
    let first = 0;
    for (let c = 0; c < pCells; c++) {
      first += cellCount[c]!;
      firstCell[c] = first;
    }
    firstCell[pCells] = first;
    for (let i = 0; i < this.numParticles; i++) {
      const c = cellOf(i);
      firstCell[c]!--;
      cellIds[firstCell[c]!] = i;
    }

    const minDist = 2 * this.particleRadius;
    const minDist2 = minDist * minDist;
    for (let iter = 0; iter < iters; iter++) {
      for (let i = 0; i < this.numParticles; i++) {
        const px = pos[2 * i]!;
        const py = pos[2 * i + 1]!;
        const pxi = Math.floor(px * pInvSpacing);
        const pyi = Math.floor(py * pInvSpacing);
        const x0 = Math.max(pxi - 1, 0);
        const y0 = Math.max(pyi - 1, 0);
        const x1 = Math.min(pxi + 1, pNumX - 1);
        const y1 = Math.min(pyi + 1, pNumY - 1);
        for (let xi = x0; xi <= x1; xi++) {
          for (let yi = y0; yi <= y1; yi++) {
            const c = xi * pNumY + yi;
            for (let j = firstCell[c]!; j < firstCell[c + 1]!; j++) {
              const id = cellIds[j]!;
              if (id === i) continue;
              let dx = pos[2 * id]! - pos[2 * i]!;
              let dy = pos[2 * id + 1]! - pos[2 * i + 1]!;
              const d2 = dx * dx + dy * dy;
              if (d2 > minDist2 || d2 === 0) continue;
              const d = Math.sqrt(d2);
              const k = (0.5 * (minDist - d)) / d;
              dx *= k;
              dy *= k;
              pos[2 * i]! -= dx;
              pos[2 * i + 1]! -= dy;
              pos[2 * id]! += dx;
              pos[2 * id + 1]! += dy;
            }
          }
        }
      }
    }
  }

  private collide(ob: FluidStepOptions["obstacle"]): void {
    const r = this.particleRadius;
    const minX = this.h + r;
    const maxX = (this.numX - 1) * this.h - r;
    const minY = this.h + r;
    const maxY = (this.numY - 1) * this.h - r;
    const reach = ob.radius + r;
    for (let i = 0; i < this.numParticles; i++) {
      let x = this.pos[2 * i]!;
      let y = this.pos[2 * i + 1]!;
      if (ob.active) {
        const dx = x - ob.x;
        const dy = y - ob.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < reach * reach && d2 > 0) {
          const d = Math.sqrt(d2);
          x = ob.x + (dx / d) * reach;
          y = ob.y + (dy / d) * reach;
          this.vel[2 * i] = ob.vx;
          this.vel[2 * i + 1] = ob.vy;
        }
      }
      if (x < minX) {
        x = minX;
        this.vel[2 * i] = 0;
      }
      if (x > maxX) {
        x = maxX;
        this.vel[2 * i] = 0;
      }
      if (y < minY) {
        y = minY;
        this.vel[2 * i + 1] = 0;
      }
      if (y > maxY) {
        y = maxY;
        this.vel[2 * i + 1] = 0;
      }
      this.pos[2 * i] = x;
      this.pos[2 * i + 1] = y;
    }
  }

  private transfer(toGrid: boolean, flipRatio: number): void {
    const n = this.numY;
    const h = this.h;
    const h1 = this.invSpacing;
    const h2 = 0.5 * h;
    const cells = this.numX * this.numY;

    if (toGrid) {
      this.prevU.set(this.u);
      this.prevV.set(this.v);
      this.du.fill(0);
      this.dv.fill(0);
      this.u.fill(0);
      this.v.fill(0);
      for (let c = 0; c < cells; c++) this.cellType[c] = this.s[c] === 0 ? SOLID : AIR;
      for (let i = 0; i < this.numParticles; i++) {
        const xi = Math.min(Math.max(Math.floor(this.pos[2 * i]! * h1), 0), this.numX - 1);
        const yi = Math.min(Math.max(Math.floor(this.pos[2 * i + 1]! * h1), 0), this.numY - 1);
        const c = xi * n + yi;
        if (this.cellType[c] === AIR) this.cellType[c] = FLUID;
      }
    }

    for (let comp = 0; comp < 2; comp++) {
      const dx = comp === 0 ? 0 : h2;
      const dy = comp === 0 ? h2 : 0;
      const f = comp === 0 ? this.u : this.v;
      const prevF = comp === 0 ? this.prevU : this.prevV;
      const d = comp === 0 ? this.du : this.dv;

      for (let i = 0; i < this.numParticles; i++) {
        const x = Math.min(Math.max(this.pos[2 * i]!, h), (this.numX - 1) * h);
        const y = Math.min(Math.max(this.pos[2 * i + 1]!, h), (this.numY - 1) * h);
        const x0 = Math.min(Math.floor((x - dx) * h1), this.numX - 2);
        const tx = (x - dx - x0 * h) * h1;
        const x1 = Math.min(x0 + 1, this.numX - 2);
        const y0 = Math.min(Math.floor((y - dy) * h1), this.numY - 2);
        const ty = (y - dy - y0 * h) * h1;
        const y1 = Math.min(y0 + 1, this.numY - 2);
        const sx = 1 - tx;
        const sy = 1 - ty;
        const d0 = sx * sy;
        const d1 = tx * sy;
        const d2 = tx * ty;
        const d3 = sx * ty;
        const nr0 = x0 * n + y0;
        const nr1 = x1 * n + y0;
        const nr2 = x1 * n + y1;
        const nr3 = x0 * n + y1;

        if (toGrid) {
          const pv = this.vel[2 * i + comp]!;
          f[nr0]! += pv * d0;
          d[nr0]! += d0;
          f[nr1]! += pv * d1;
          d[nr1]! += d1;
          f[nr2]! += pv * d2;
          d[nr2]! += d2;
          f[nr3]! += pv * d3;
          d[nr3]! += d3;
        } else {
          const offset = comp === 0 ? n : 1;
          const valid = (nr: number): number =>
            this.cellType[nr] !== AIR || this.cellType[nr - offset] !== AIR ? 1 : 0;
          const v0 = valid(nr0);
          const v1 = valid(nr1);
          const v2 = valid(nr2);
          const v3 = valid(nr3);
          const sum = v0 * d0 + v1 * d1 + v2 * d2 + v3 * d3;
          if (sum > 0) {
            const pic =
              (v0 * d0 * f[nr0]! + v1 * d1 * f[nr1]! + v2 * d2 * f[nr2]! + v3 * d3 * f[nr3]!) / sum;
            const corr =
              (v0 * d0 * (f[nr0]! - prevF[nr0]!) +
                v1 * d1 * (f[nr1]! - prevF[nr1]!) +
                v2 * d2 * (f[nr2]! - prevF[nr2]!) +
                v3 * d3 * (f[nr3]! - prevF[nr3]!)) /
              sum;
            const flip = this.vel[2 * i + comp]! + corr;
            this.vel[2 * i + comp] = (1 - flipRatio) * pic + flipRatio * flip;
          }
        }
      }

      if (toGrid) {
        for (let c = 0; c < f.length; c++) if (d[c]! > 0) f[c]! /= d[c]!;
        for (let i = 0; i < this.numX; i++) {
          for (let j = 0; j < this.numY; j++) {
            const c = i * n + j;
            const solid = this.cellType[c] === SOLID;
            if (solid || (i > 0 && this.cellType[(i - 1) * n + j] === SOLID)) this.u[c] = this.prevU[c]!;
            if (solid || (j > 0 && this.cellType[i * n + j - 1] === SOLID)) this.v[c] = this.prevV[c]!;
          }
        }
      }
    }
  }

  private updateDensity(): void {
    const n = this.numY;
    const h = this.h;
    const h1 = this.invSpacing;
    const h2 = 0.5 * h;
    const d = this.density;
    d.fill(0);
    for (let i = 0; i < this.numParticles; i++) {
      const x = Math.min(Math.max(this.pos[2 * i]!, h), (this.numX - 1) * h);
      const y = Math.min(Math.max(this.pos[2 * i + 1]!, h), (this.numY - 1) * h);
      const x0 = Math.floor((x - h2) * h1);
      const tx = (x - h2 - x0 * h) * h1;
      const x1 = Math.min(x0 + 1, this.numX - 2);
      const y0 = Math.floor((y - h2) * h1);
      const ty = (y - h2 - y0 * h) * h1;
      const y1 = Math.min(y0 + 1, this.numY - 2);
      const sx = 1 - tx;
      const sy = 1 - ty;
      if (x0 < this.numX && y0 < this.numY) d[x0 * n + y0]! += sx * sy;
      if (x1 < this.numX && y0 < this.numY) d[x1 * n + y0]! += tx * sy;
      if (x1 < this.numX && y1 < this.numY) d[x1 * n + y1]! += tx * ty;
      if (x0 < this.numX && y1 < this.numY) d[x0 * n + y1]! += sx * ty;
    }
    if (this.restDensity === 0) {
      let sum = 0;
      let count = 0;
      for (let c = 0; c < this.numX * this.numY; c++) {
        if (this.cellType[c] === FLUID) {
          sum += d[c]!;
          count++;
        }
      }
      if (count > 0) this.restDensity = sum / count;
    }
  }

  private solve(iters: number, overRelaxation: number): void {
    const n = this.numY;
    this.prevU.set(this.u);
    this.prevV.set(this.v);
    for (let iter = 0; iter < iters; iter++) {
      for (let i = 1; i < this.numX - 1; i++) {
        for (let j = 1; j < this.numY - 1; j++) {
          const c = i * n + j;
          if (this.cellType[c] !== FLUID) continue;
          const left = (i - 1) * n + j;
          const right = (i + 1) * n + j;
          const bottom = i * n + j - 1;
          const top = i * n + j + 1;
          const sx0 = this.s[left]!;
          const sx1 = this.s[right]!;
          const sy0 = this.s[bottom]!;
          const sy1 = this.s[top]!;
          const ss = sx0 + sx1 + sy0 + sy1;
          if (ss === 0) continue;
          let div = this.u[right]! - this.u[c]! + this.v[top]! - this.v[c]!;
          // Push apart cells that have drifted denser than rest.
          if (this.restDensity > 0) {
            const compression = this.density[c]! - this.restDensity;
            if (compression > 0) div -= compression;
          }
          const p = (-div / ss) * overRelaxation;
          this.u[c]! -= sx0 * p;
          this.u[right]! += sx1 * p;
          this.v[c]! -= sy0 * p;
          this.v[top]! += sy1 * p;
        }
      }
    }
  }

  /** Grid flow speed in the cell containing a point. */
  sampleSpeed(x: number, y: number): number {
    const n = this.numY;
    const i = Math.min(Math.max(Math.floor(x * this.invSpacing), 1), this.numX - 2);
    const j = Math.min(Math.max(Math.floor(y * this.invSpacing), 1), this.numY - 2);
    const c = i * n + j;
    const u = 0.5 * (this.u[c]! + this.u[c + n]!);
    const v = 0.5 * (this.v[c]! + this.v[c + 1]!);
    return Math.sqrt(u * u + v * v);
  }

  /** Bilinear density at a point, normalised so resting fluid reads ~1. */
  sampleDensity(x: number, y: number): number {
    if (this.restDensity === 0) return 0;
    const h1 = this.invSpacing;
    const fx = Math.min(Math.max(x * h1 - 0.5, 0), this.numX - 1.001);
    const fy = Math.min(Math.max(y * h1 - 0.5, 0), this.numY - 1.001);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const n = this.numY;
    const x1 = Math.min(x0 + 1, this.numX - 1);
    const y1 = Math.min(y0 + 1, this.numY - 1);
    const d = this.density;
    const v =
      (1 - tx) * (1 - ty) * d[x0 * n + y0]! +
      tx * (1 - ty) * d[x1 * n + y0]! +
      tx * ty * d[x1 * n + y1]! +
      (1 - tx) * ty * d[x0 * n + y1]!;
    return v / this.restDensity;
  }
}
