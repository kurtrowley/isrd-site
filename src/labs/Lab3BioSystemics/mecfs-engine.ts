// ME/CFS Population Outbreak Simulator — engine ported from systemic_writer-site.
// Ported to TypeScript for the ISRD.com React app.

export const STATUS = {
  HEALTHY:    'healthy',
  EXPOSED:    'exposed',
  INFECTIOUS: 'infectious',
  RECOVERING: 'recovering',
  RECOVERED:  'recovered',
  LONG_COVID: 'long_covid',
  CFS:        'cfs',
  SEVERE_CFS: 'severe_cfs',
} as const;
export type StatusKey = typeof STATUS[keyof typeof STATUS];

export const STATUS_LABEL: Record<StatusKey, string> = {
  healthy:    'Healthy',
  exposed:    'Exposed',
  infectious: 'Infectious (acute)',
  recovering: 'Recovering',
  recovered:  'Fully recovered',
  long_covid: 'Post-Viral Syndrome',
  cfs:        'ME/CFS',
  severe_cfs: 'Severe ME/CFS',
};

export const STATUS_RGB: Record<StatusKey, [number, number, number]> = {
  healthy:    [50, 80, 96],
  exposed:    [170, 140, 30],
  infectious: [200, 80, 30],
  recovering: [100, 140, 70],
  recovered:  [50, 140, 100],
  long_covid: [180, 110, 40],
  cfs:        [140, 28, 58],
  severe_cfs: [70, 6, 28],
};

const NF = ['Sarah','Emma','Olivia','Ava','Isabella','Sophia','Mia','Charlotte',
  'Amelia','Harper','Evelyn','Abigail','Emily','Elizabeth','Sofia','Madison',
  'Scarlett','Victoria','Luna','Grace','Chloe','Penelope','Layla','Riley',
  'Zoey','Nora','Lily','Eleanor','Hannah','Lillian','Aubrey','Hazel','Violet',
  'Aurora','Savannah','Audrey','Brooklyn','Bella','Claire','Skylar'];
const NM = ['Liam','Noah','Oliver','Elijah','James','William','Benjamin','Lucas',
  'Henry','Alexander','Mason','Ethan','Daniel','Jacob','Logan','Jackson',
  'Sebastian','Jack','Aiden','Owen','Samuel','Ryan','Nathan','Caleb','Isaiah',
  'Matthew','Eli','Gabriel','Julian','Wyatt','Dylan','Luke','Hunter','Isaac',
  'Grayson','David','Andrew','Josiah','Chris','Marcus'];

export interface SimEnv {
  r0: number;
  pathogenSeverity: number;
  economicStress: number;
  pollution: number;
  healthcareAccess: number;
  socialInfrastructure: number;
  socialContactLevel: number;
  sanitationLevel: number;
  transmission?: string;
  outbreakId?: string;
  outbreakLabel?: string;
}

export interface Symptoms {
  fatigue: number; pem: number; cognitive: number;
  autonomic: number; pain: number; sleep: number;
  brainstem: number; hpa: number; vagal: number;
}

export interface Flash { x1:number; y1:number; x2:number; y2:number; t:number; }

export class Person {
  id: number; row: number; col: number; isViewpoint: boolean;
  sex: 'F'|'M'; age: number; name: string;
  susceptibility: number; priorEBV: boolean; baselineStress: number;
  immuneFunction: number; sleepQuality: number; economicStress: number;
  pollutionExp: number; socialSupport: number; priorConditions: number;
  neurodivergence: number; emotionalStressLoad: number; mechanicalBrainstemLoad: number;
  digestiveHealth: number; metabolicHealth: number; generalFitness: number; dietQuality: number;
  moldExposure: number; chemicalExposure: number;
  priorHHV6: boolean; priorCMV: boolean; priorLyme: boolean; priorMycoplasma: boolean;
  autonomicAcute: number;

  status: StatusKey; exposedDay: number|null; infectDay: number|null;
  acuteEndDay: number|null; cfsDay: number|null;
  outcome: 'recovered'|'long_covid'|'cfs'|'severe_cfs'|null;
  illnessSeverity: number; cfsRisk: number; symptoms: Symptoms|null;
  colorT: number; prevRGB: [number,number,number]; currRGB: [number,number,number];
  pulseOffset: number; flashTimer: number;
  hovered: boolean;

  constructor(id: number, row: number, col: number, isViewpoint = false) {
    this.id = id; this.row = row; this.col = col; this.isViewpoint = isViewpoint;
    this.sex = Math.random() < 0.51 ? 'F' : 'M';
    this.age = 18 + Math.floor(Math.random() * 62);
    const pool = this.sex === 'F' ? NF : NM;
    this.name = isViewpoint ? 'You' : pool[Math.floor(Math.random() * pool.length)];
    this.susceptibility      = Math.random();
    this.priorEBV            = Math.random() < 0.90;
    this.baselineStress      = Math.random();
    this.immuneFunction      = 0.35 + Math.random() * 0.65;
    this.sleepQuality        = Math.random();
    this.economicStress      = Math.random();
    this.pollutionExp        = Math.random();
    this.socialSupport       = Math.random();
    this.priorConditions     = Math.random() < 0.30 ? Math.random() : Math.random() * 0.3;
    this.neurodivergence     = Math.random() < 0.18 ? 0.35 + Math.random() * 0.65 : Math.random() * 0.2;
    this.emotionalStressLoad = Math.random();
    this.mechanicalBrainstemLoad = Math.random() < 0.07 ? 0.4 + Math.random() * 0.6 : Math.random() * 0.12;
    this.digestiveHealth     = Math.random() < 0.20 ? 0.4 + Math.random() * 0.6 : Math.random() * 0.4;
    this.metabolicHealth     = Math.random() < 0.25 ? 0.4 + Math.random() * 0.6 : Math.random() * 0.4;
    this.generalFitness      = Math.random();
    this.dietQuality         = Math.random();
    this.moldExposure        = Math.random() < 0.12 ? 0.3 + Math.random() * 0.7 : Math.random() * 0.15;
    this.chemicalExposure    = Math.random() < 0.10 ? 0.3 + Math.random() * 0.7 : Math.random() * 0.12;
    this.priorHHV6           = Math.random() < 0.95;
    this.priorCMV            = Math.random() < 0.60;
    this.priorLyme           = Math.random() < 0.08;
    this.priorMycoplasma     = Math.random() < 0.30;
    this.autonomicAcute      = 0;

    if (isViewpoint) {
      this.sex = 'F'; this.age = 35 + Math.floor(Math.random() * 15);
      this.susceptibility = 0.45 + Math.random() * 0.45;
      this.priorEBV = true; this.priorHHV6 = true;
      this.baselineStress = 0.35 + Math.random() * 0.45;
      this.emotionalStressLoad = 0.30 + Math.random() * 0.45;
      this.immuneFunction = 0.25 + Math.random() * 0.45;
      this.sleepQuality = 0.20 + Math.random() * 0.50;
      this.priorConditions = 0.15 + Math.random() * 0.40;
      this.digestiveHealth = 0.20 + Math.random() * 0.50;
      this.neurodivergence = Math.random() < 0.25 ? 0.3 + Math.random() * 0.5 : Math.random() * 0.2;
      this.moldExposure = Math.random() * 0.3;
      this.chemicalExposure = Math.random() * 0.2;
    }

    this.status = STATUS.HEALTHY;
    this.exposedDay = null; this.infectDay = null; this.acuteEndDay = null;
    this.cfsDay = null; this.outcome = null;
    this.illnessSeverity = 0; this.cfsRisk = 0; this.symptoms = null;
    this.colorT = 0;
    this.prevRGB = [...STATUS_RGB.healthy];
    this.currRGB = [...STATUS_RGB.healthy];
    this.pulseOffset = Math.random() * Math.PI * 2;
    this.flashTimer = 0; this.hovered = false;
  }

  computeCFSRisk(severity: number, env: SimEnv): number {
    const pathogenMult = 0.20 + (env.pathogenSeverity ?? 0.5) * 1.60;
    const base = (this.sex === 'F' ? 0.150 : 0.065) * pathogenMult;
    const priorViralBonus =
      (this.priorHHV6       ? 0.035 : 0) +
      (this.priorCMV        ? 0.025 : 0) +
      (this.priorLyme       ? 0.070 : 0) +
      (this.priorMycoplasma ? 0.035 : 0);
    const agePeak  = this.age >= 35 && this.age <= 64 ? 0.040 :
                     this.age >= 25 && this.age < 35  ? 0.010 :
                     this.age < 18                    ?-0.080 : 0;
    const envAdj   = (env.economicStress      ?? 0.3) * 0.012
                   + (env.pollution           ?? 0.3) * 0.008
                   - (env.healthcareAccess    ?? 0.5) * 0.012
                   - (env.socialInfrastructure?? 0.5) * 0.006;
    const rawScore =
      severity                       * 0.250 +
      this.autonomicAcute            * 0.200 +
      this.priorConditions           * 0.100 +
      (this.priorEBV ? 0.063 : 0)           +
      this.baselineStress            * 0.080 +
      this.susceptibility            * 0.060 +
      (1 - this.sleepQuality)        * 0.060 +
      (1 - this.immuneFunction)      * 0.050 +
      this.economicStress            * 0.040 +
      this.pollutionExp              * 0.030 +
      (1 - this.socialSupport)       * 0.040 +
      this.neurodivergence           * 0.040 +
      this.emotionalStressLoad       * 0.060 +
      this.mechanicalBrainstemLoad   * 0.080 +
      this.digestiveHealth           * 0.045 +
      this.metabolicHealth           * 0.050 +
      (1 - this.generalFitness)      * 0.030 +
      (1 - this.dietQuality)         * 0.025 +
      (this.moldExposure     ?? 0)   * 0.035 +
      (this.chemicalExposure ?? 0)   * 0.030 +
      priorViralBonus + agePeak + envAdj;
    const score = Math.min(1, rawScore / 1.35);
    return Math.min(Math.max(base * (0.40 + score * 1.20), 0.01), 0.92);
  }

  expose(day: number): boolean {
    if (this.status !== STATUS.HEALTHY) return false;
    this.status = STATUS.EXPOSED; this.exposedDay = day;
    this.infectDay = day + 3 + Math.floor(Math.random() * 4);
    this._transitionColor(); return true;
  }

  update(day: number, env: SimEnv): void {
    switch (this.status) {
      case STATUS.EXPOSED:
        if (day >= this.infectDay!) {
          this.status = STATUS.INFECTIOUS;
          this.illnessSeverity = 0.15 + Math.random() * 0.85;
          this.autonomicAcute  = Math.min(1, this.illnessSeverity * (0.4 + Math.random() * 0.8));
          this.cfsRisk = this.computeCFSRisk(this.illnessSeverity, env);
          this.acuteEndDay = day + 7 + Math.floor(Math.random() * 8);
          this._transitionColor();
        }
        break;
      case STATUS.INFECTIOUS:
        if (day >= this.acuteEndDay!) {
          this.status = STATUS.RECOVERING;
          const r = Math.random();
          if (r < this.cfsRisk) {
            const severe = Math.random() < (this.cfsRisk > 0.55 ? 0.45 : 0.2);
            this.outcome = severe ? 'severe_cfs' : 'cfs';
            this.cfsDay = day + 60 + Math.floor(Math.random() * 120);
          } else if (r < this.cfsRisk + 0.12) {
            this.outcome = 'long_covid';
            this.cfsDay = day + 21 + Math.floor(Math.random() * 60);
          } else {
            this.outcome = 'recovered'; this.cfsDay = null;
          }
          this._transitionColor();
        }
        break;
      case STATUS.RECOVERING:
        if (this.cfsDay && day >= this.cfsDay) {
          this.status = this.outcome === 'cfs' ? STATUS.CFS :
                        this.outcome === 'severe_cfs' ? STATUS.SEVERE_CFS : STATUS.LONG_COVID;
          this._assignSymptoms(); this._transitionColor();
        } else if (!this.cfsDay && day >= ((this.acuteEndDay ?? 0) + 21 + Math.floor(Math.random()*14))) {
          this.status = STATUS.RECOVERED; this._transitionColor();
        }
        break;
      case STATUS.LONG_COVID: {
        const pRecov = Math.max(0.0005,
          (0.003 + this.immuneFunction * 0.002 - this.baselineStress * 0.001)
          * (0.5 + this.socialSupport * 0.5));
        if (Math.random() < pRecov) { this.status = STATUS.RECOVERED; this.symptoms = null; this._transitionColor(); }
        break;
      }
      case STATUS.CFS: {
        const pRecov = 0.0001 * (0.4 + this.immuneFunction * 0.4 + this.socialSupport * 0.2);
        if (Math.random() < pRecov) { this.status = STATUS.LONG_COVID; this._assignSymptoms(); this._transitionColor(); }
        break;
      }
      case STATUS.SEVERE_CFS: {
        const pRecov = 0.00004 * (0.5 + this.immuneFunction * 0.5);
        if (Math.random() < pRecov) { this.status = STATUS.CFS; this._transitionColor(); }
        break;
      }
    }
    if (this.colorT < 1) this.colorT = Math.min(1, this.colorT + 0.04);
    if (this.flashTimer > 0) this.flashTimer--;
  }

  _transitionColor(): void {
    this.prevRGB = this.lerpedColor();
    this.currRGB = [...STATUS_RGB[this.status]];
    this.colorT = 0;
  }

  lerpedColor(): [number,number,number] {
    const t = this.colorT;
    return this.prevRGB.map((v, i) => Math.round(v + (this.currRGB[i] - v) * t)) as [number,number,number];
  }

  get color(): string { const [r,g,b] = this.lerpedColor(); return `rgb(${r},${g},${b})`; }

  _assignSymptoms(): void {
    const s = this.outcome === 'severe_cfs' ? 0.65 + Math.random() * 0.35 : 0.28 + Math.random() * 0.52;
    this.symptoms = {
      fatigue:   s,
      pem:       s * (0.8 + Math.random() * 0.4),
      cognitive: s * (0.5 + Math.random() * 0.5),
      autonomic: s * (0.4 + Math.random() * 0.6),
      pain:      s * (0.3 + Math.random() * 0.7),
      sleep:     s * (0.5 + Math.random() * 0.5),
      brainstem: s * (0.45 + Math.random() * 0.55),
      hpa:       s * (0.4 + Math.random() * 0.5),
      vagal:     s * (0.5 + Math.random() * 0.5),
    };
  }

  get hasCFS(): boolean { return this.status === STATUS.CFS || this.status === STATUS.SEVERE_CFS; }
  get isInfected(): boolean { return [STATUS.EXPOSED, STATUS.INFECTIOUS, STATUS.RECOVERING].includes(this.status as any); }
  get isContagious(): boolean { return this.status === STATUS.INFECTIOUS; }
}

export interface OutbreakPreset {
  id: string; label: string; category: string; desc: string;
  r0: number; pathogenSeverity: number; transmission?: string;
}

export const OUTBREAK_PRESETS: OutbreakPreset[] = [
  { id:'influenza', label:'Seasonal Influenza', category:'Respiratory virus',
    desc:'Typical winter flu season. Moderate severity, standard respiratory transmission.',
    r0:1.3, pathogenSeverity:0.20 },
  { id:'covid19', label:'COVID-19 (Omicron)', category:'Respiratory virus',
    desc:'High transmissibility, moderate severity. Long COVID / ME/CFS risk well-documented.',
    r0:5.0, pathogenSeverity:0.55 },
  { id:'ebv', label:'Epstein-Barr (Mono)', category:'Viral',
    desc:'Infectious mononucleosis. Strong ME/CFS conversion risk via post-viral syndrome.',
    r0:1.5, pathogenSeverity:0.70 },
  { id:'sars1', label:'SARS-CoV-1 (2003)', category:'Respiratory virus',
    desc:'Original SARS — high severity, 4-year follow-up showed ~27% CFS rate.',
    r0:2.0, pathogenSeverity:1.0 },
  { id:'lyme', label:'Lyme Disease', category:'Bacterial (tick)',
    desc:'Tick-borne infection. Post-treatment Lyme syndrome overlaps heavily with ME/CFS.',
    r0:0.0, pathogenSeverity:0.75, transmission:'environmental' },
  { id:'mold', label:'Toxic Mold Exposure', category:'Environmental',
    desc:'Mycotoxin-driven immune disruption. Community-wide environmental event.',
    r0:0.0, pathogenSeverity:0.60, transmission:'environmental' },
  { id:'covid_alpha', label:'COVID-19 (Alpha/Delta)', category:'Respiratory virus',
    desc:'Earlier variants — higher severity, more hospitalisation, higher ME/CFS burden.',
    r0:4.0, pathogenSeverity:0.75 },
];
