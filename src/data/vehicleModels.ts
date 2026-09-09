export type VehicleCategory = 'small' | 'medium' | 'big';

export interface VehicleModel {
  srNo: number;
  name: string;
  category: VehicleCategory;
  mrp: number;
}

export type MatStyleId = 'checkmate' | 'exotic';

export interface MatColorOption {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  stitchColor: string;
  description: string;
}

export interface MatStyle {
  id: MatStyleId;
  name: string;
  tagline: string;
  patternType: 'diamond' | 'ribbed';
  description: string;
  colors: MatColorOption[];
}

export const PRICING_BY_CATEGORY: Record<VehicleCategory, { label: string; mrp: number; count: number }> = {
  small: { label: 'Small Vehicle', mrp: 4190, count: 19 },
  medium: { label: 'Medium Vehicle', mrp: 4690, count: 59 },
  big: { label: 'Big Vehicle', mrp: 6290, count: 24 },
};

export const MAT_STYLES: Record<MatStyleId, MatStyle> = {
  checkmate: {
    id: 'checkmate',
    name: 'Checkmate',
    tagline: 'Sport Geometric Precision Grid',
    patternType: 'diamond',
    description: 'Precision laser diamond-matrix stitching with reinforced heelpad, engineered for maximum grip, rugged endurance, and a bold sporty cockpit feel.',
    colors: [
      {
        id: 'cm-black',
        name: 'Black',
        primaryColor: '#121214',
        accentColor: '#E5272E',
        stitchColor: '#E5272E',
        description: 'Stealth obsidian textured base with aggressive TorqMax crimson red contrast stitching.',
      },
      {
        id: 'cm-beige',
        name: 'Beige',
        primaryColor: '#C4A482',
        accentColor: '#8C6D46',
        stitchColor: '#FFFFFF',
        description: 'Warm luxury cream beige with tailored tone-on-tone diamond precision seams.',
      },
    ],
  },
  exotic: {
    id: 'exotic',
    name: 'Exotic',
    tagline: 'Executive Fluid Ribbed Quilt',
    patternType: 'ribbed',
    description: 'Flowing horizontal channeled cushions with cushioned dual-density padding, delivering bespoke ultra-luxury styling and cloud-like foot comfort.',
    colors: [
      {
        id: 'ex-black',
        name: 'Black',
        primaryColor: '#141416',
        accentColor: '#2B2B30',
        stitchColor: '#4A4A52',
        description: 'Premium obsidian black with refined matte trim and soft touch finish.',
      },
      {
        id: 'ex-beige',
        name: 'Beige',
        primaryColor: '#C8A882',
        accentColor: '#96744E',
        stitchColor: '#E8D3B8',
        description: 'Elegant cream beige leatherette with tailored luxury piping for executive cockpits.',
      },
    ],
  },
};

export const VEHICLE_MODELS: VehicleModel[] = [
  // ─── SMALL VEHICLES (MRP-4190) ───
  { srNo: 1, name: 'ALTO 2018 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 2, name: 'BRIO 2017 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 3, name: 'CELERIO 2014 - 2021', category: 'small', mrp: 4190 },
  { srNo: 4, name: 'EON 2018 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 5, name: 'I-10 GRAND NIOS / AURA 2020 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 6, name: 'I-10 GRAND / XCENT 2017 - 2020', category: 'small', mrp: 4190 },
  { srNo: 7, name: 'IGNIS 2016 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 8, name: 'RITZ 2009 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 9, name: 'SANTRO 2018 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 10, name: 'S-PRESSO 2019 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 11, name: 'SWIFT 2005 - 2012', category: 'small', mrp: 4190 },
  { srNo: 12, name: 'SWIFT / DZIRE 2012 - 2017', category: 'small', mrp: 4190 },
  { srNo: 13, name: 'SWIFT / DZIRE 2018 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 14, name: 'TIAGO 2016 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 15, name: 'TIGOR EV 2022 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 16, name: 'WAGON-R 2019 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 17, name: 'WAGON-R 2010 - 2018', category: 'small', mrp: 4190 },
  { srNo: 18, name: 'COMET ELECTRIC 2023 (ONWARDS)', category: 'small', mrp: 4190 },
  { srNo: 19, name: 'ETIOS LIVA / ETIOS CROSS 2011 - 2020', category: 'small', mrp: 4190 },

  // ─── MEDIUM VEHICLES (MRP-4690) ───
  { srNo: 20, name: 'ALTROZ 2020 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 21, name: 'AMAZE 2018 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 22, name: 'ASTOR 2021 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 23, name: 'BALENO 2016 (ONWARDS) / GLANZA / FRONX', category: 'medium', mrp: 4690 },
  { srNo: 24, name: 'BREZZA 2016 - 2022', category: 'medium', mrp: 4690 },
  { srNo: 25, name: 'BREZZA 2022 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 26, name: 'CELERIO 2021 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 27, name: 'CIAZ 2015 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 28, name: 'CITROEN C3 2022 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 29, name: 'CITROEN ELECTRIC C3 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 30, name: 'CITY I-VTEC 2014 - 2019', category: 'medium', mrp: 4690 },
  { srNo: 31, name: 'CRETA 2015 - 2020', category: 'medium', mrp: 4690 },
  { srNo: 32, name: 'CRETA 2020 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 33, name: 'DUSTER 2012 - 2022', category: 'medium', mrp: 4690 },
  { srNo: 34, name: 'ECOSPORT 2017 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 35, name: 'EXTER 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 36, name: 'GRAND VITARA 2022 (ONWARDS) / HYRYDER / VICTORIS', category: 'medium', mrp: 4690 },
  { srNo: 37, name: 'HARRIER AT 2020 - 2023', category: 'medium', mrp: 4690 },
  { srNo: 38, name: 'I-20 ELITE 2014 - 2019', category: 'medium', mrp: 4690 },
  { srNo: 39, name: 'I-20 ELITE 2020 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 40, name: 'JEEP COMPASS 2016 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 41, name: 'JIMNY 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 42, name: 'KICKS 2019 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 43, name: 'KUSHAQ / TAIGUN 2021 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 44, name: 'MAGNITE / KIGER 2020 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 45, name: 'NEXON AT 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 46, name: 'NEXON AT 2017 - 2023', category: 'medium', mrp: 4690 },
  { srNo: 47, name: 'POLO 2010 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 48, name: 'PUNCH 2021', category: 'medium', mrp: 4690 },
  { srNo: 49, name: 'S-CROSS 2015 - 2022', category: 'medium', mrp: 4690 },
  { srNo: 50, name: 'SELTOS 2019 - 2023', category: 'medium', mrp: 4690 },
  { srNo: 51, name: 'SLAVIA / VIRTUS 2022 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 52, name: 'SONET 2020 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 53, name: 'VENTO 2012 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 54, name: 'VENUE 2019', category: 'medium', mrp: 4690 },
  { srNo: 55, name: 'VERNA 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 56, name: 'VERNA 2011 - 2017', category: 'medium', mrp: 4690 },
  { srNo: 57, name: 'XUV 400 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 58, name: 'VERNA 2017 - 2022', category: 'medium', mrp: 4690 },
  { srNo: 59, name: 'WRV / JAZZ 2015 - 2019', category: 'medium', mrp: 4690 },
  { srNo: 60, name: 'ELEVATE 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 61, name: 'XUV 300 MT 2019 / 3XO (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 62, name: 'NEXON MT 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 63, name: 'PUNCH EV 2024 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 64, name: 'HARRIER AT 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 65, name: 'HARRIER MT 2023 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 66, name: 'CURVV MT 2024 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 67, name: 'CURVV AT 2024 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 68, name: 'THAR ROXX AT 2024 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 69, name: 'THAR ROXX MT 2024 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 70, name: 'CRETA EV 2025 (ONWARDS)', category: 'medium', mrp: 4690 },
  { srNo: 71, name: 'ETIOS 2010 - 2020', category: 'medium', mrp: 4690 },
  { srNo: 72, name: 'KYLAQ 2024', category: 'medium', mrp: 4690 },
  { srNo: 73, name: 'SYROS 2025', category: 'medium', mrp: 4690 },
  { srNo: 74, name: 'SYROS TOP 2025', category: 'medium', mrp: 4690 },
  { srNo: 75, name: 'PUNCH EV 25', category: 'medium', mrp: 4690 },
  { srNo: 76, name: 'DUSTER 26', category: 'medium', mrp: 4690 },
  { srNo: 77, name: 'PUNCH 26', category: 'medium', mrp: 4690 },
  { srNo: 78, name: 'VENUE 25', category: 'medium', mrp: 4690 },
  { srNo: 79, name: 'TATA SIERRA 25', category: 'medium', mrp: 4690 },

  // ─── BIG VEHICLES (MRP-6290) ───
  { srNo: 80, name: 'ALCAZAR AUTO 7 SEATER 2021 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 81, name: 'BOLERO BS6 2021 7 SEATER (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 82, name: 'BOLERO NEO 2022 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 83, name: 'CARENS MT 6 SEATER 2022 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 84, name: 'CRYSTA / FORTUNER AT 2017 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 85, name: 'ERTIGA 2018 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 86, name: 'EECO 2010 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 87, name: 'HECTOR 2019 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 88, name: 'HILUX 2022 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 89, name: 'HYCROSS ZX 2023 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 90, name: 'INNOVA 2007 - 2016', category: 'big', mrp: 6290 },
  { srNo: 91, name: 'SAFARI AT 7 SEATER 2021 - 2023', category: 'big', mrp: 6290 },
  { srNo: 92, name: 'SCORPIO N 7 SEATER 2022 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 93, name: 'SCORPIO 2011 - 2021', category: 'big', mrp: 6290 },
  { srNo: 94, name: 'TRIBER 2019 AUTO (ONWARDS) / GRAVITY', category: 'big', mrp: 6290 },
  { srNo: 95, name: 'TRIBER 2019 MANUAL (ONWARDS) / GRAVITY', category: 'big', mrp: 6290 },
  { srNo: 96, name: 'XL-6 2019', category: 'big', mrp: 6290 },
  { srNo: 97, name: 'XL-6 2015 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 98, name: 'XUV 700 5 SEATER AX5 2021 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 99, name: 'XUV 700 7 SEATER 2021 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 100, name: 'SAFARI AT 7 SEATER 2023 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 101, name: 'SAFARI MT 7 SEATER 2023 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 102, name: 'SCORPIO CLASSIC 7 SEATER 2021 (ONWARDS)', category: 'big', mrp: 6290 },
  { srNo: 103, name: 'ERTIGA CNG 2025', category: 'big', mrp: 6290 },
];
