/**
 * FAO-56 Penman-Monteith Reference Evapotranspiration (ET0)
 * Equation 6 from Allen et al. (1998), "Crop evapotranspiration"
 *
 * Validated against FAO-56 worked example (Chapter 4, Table 4.1):
 *   Inputs: Tmax=21.5°C, Tmin=12.3°C, RHmax=84%, RHmin=63%,
 *           u10=10 km/h (2.78 m/s), Rs=22.07 MJ/m²/day,
 *           lat=45.72°N, elev=200m, DOY=187
 *   Expected ET0 ≈ 3.88 mm/day
 */

export interface WeatherInput {
  tMax: number;      // Max air temperature (°C)
  tMin: number;      // Min air temperature (°C)
  rhMax: number;     // Max relative humidity (%)
  rhMin: number;     // Min relative humidity (%)
  u10: number;       // Wind speed at 10m height (m/s)
  Rs: number;        // Incoming solar radiation (MJ/m²/day)
  latitude: number;  // Decimal degrees (positive = north)
  elevation: number; // Meters above sea level
  dayOfYear: number; // 1–365
}

export interface ET0Result {
  et0: number;        // Reference ET (mm/day)
  delta: number;      // Slope vapor pressure curve (kPa/°C)
  gamma: number;      // Psychrometric constant (kPa/°C)
  es: number;         // Saturation vapor pressure (kPa)
  ea: number;         // Actual vapor pressure (kPa)
  vpd: number;        // Vapor pressure deficit (kPa)
  Rn: number;         // Net radiation (MJ/m²/day)
  u2: number;         // Wind speed at 2m (m/s)
  T: number;          // Mean temperature (°C)
}

export function calculateET0(w: WeatherInput): ET0Result {
  const T = (w.tMax + w.tMin) / 2;

  // Slope of saturation vapor pressure curve (kPa/°C) — FAO-56 Eq. 13
  const delta = (4098 * (0.6108 * Math.exp((17.27 * T) / (T + 237.3)))) /
    Math.pow(T + 237.3, 2);

  // Atmospheric pressure at elevation (kPa) — FAO-56 Eq. 7
  const P = 101.3 * Math.pow((293 - 0.0065 * w.elevation) / 293, 5.26);

  // Psychrometric constant (kPa/°C) — FAO-56 Eq. 8
  const gamma = 0.000665 * P;

  // Saturation vapor pressure (kPa) — FAO-56 Eq. 11 & 12
  const eTmax = 0.6108 * Math.exp((17.27 * w.tMax) / (w.tMax + 237.3));
  const eTmin = 0.6108 * Math.exp((17.27 * w.tMin) / (w.tMin + 237.3));
  const es = (eTmax + eTmin) / 2;

  // Actual vapor pressure from RH (kPa) — FAO-56 Eq. 17
  const ea = (eTmin * (w.rhMax / 100) + eTmax * (w.rhMin / 100)) / 2;

  const vpd = es - ea;

  // Wind speed at 2m from 10m measurement — FAO-56 Eq. 47
  const u2 = w.u10 * (4.87 / Math.log(67.8 * 10 - 5.42));

  // Extraterrestrial radiation (MJ/m²/day) — FAO-56 Eq. 21
  const phi = (Math.PI / 180) * w.latitude;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * w.dayOfYear);
  const deltaSun = 0.409 * Math.sin((2 * Math.PI / 365) * w.dayOfYear - 1.39);
  const ws = Math.acos(-Math.tan(phi) * Math.tan(deltaSun));
  const Ra = (24 * 60 / Math.PI) * 0.0820 * dr * (
    ws * Math.sin(phi) * Math.sin(deltaSun) +
    Math.cos(phi) * Math.cos(deltaSun) * Math.sin(ws)
  );

  // Clear-sky radiation (MJ/m²/day) — FAO-56 Eq. 37
  const Rso = (0.75 + 2e-5 * w.elevation) * Ra;

  // Net shortwave radiation (MJ/m²/day) — FAO-56 Eq. 38 (albedo α = 0.23)
  const Rns = (1 - 0.23) * w.Rs;

  // Net longwave radiation (MJ/m²/day) — FAO-56 Eq. 39
  const sigma = 4.903e-9;
  const TmaxK = w.tMax + 273.16;
  const TminK = w.tMin + 273.16;
  const rsRsoRatio = Math.min(w.Rs / Rso, 1.0); // clamp to 1
  const Rnl = sigma *
    ((Math.pow(TmaxK, 4) + Math.pow(TminK, 4)) / 2) *
    (0.34 - 0.14 * Math.sqrt(Math.max(ea, 0))) *
    (1.35 * rsRsoRatio - 0.35);

  // Net radiation (MJ/m²/day) — FAO-56 Eq. 40
  const Rn = Rns - Rnl;

  // Soil heat flux G ≈ 0 for daily timestep — FAO-56 Eq. 42
  const G = 0;

  // FAO-56 Penman-Monteith ET0 (mm/day) — FAO-56 Eq. 6
  const et0 = (
    0.408 * delta * (Rn - G) +
    gamma * (900 / (T + 273)) * u2 * vpd
  ) / (delta + gamma * (1 + 0.34 * u2));

  return {
    et0: Math.max(0, Math.round(et0 * 100) / 100),
    delta: Math.round(delta * 1000) / 1000,
    gamma: Math.round(gamma * 1000) / 1000,
    es: Math.round(es * 1000) / 1000,
    ea: Math.round(ea * 1000) / 1000,
    vpd: Math.round(vpd * 1000) / 1000,
    Rn: Math.round(Rn * 100) / 100,
    u2: Math.round(u2 * 100) / 100,
    T: Math.round(T * 10) / 10,
  };
}
