export type TopoPoints = {
  id: string;
  description: string;
  longitude: number;
  latitude: number;
  climbing_area_name: string;
  climbing_sector: string;
}

export type CragStats = {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export type ClimbingArea = {
  id: number;
  name: string;
  description: string;
  access: string;
  access_from_dahab_minutes: string;
  route_count: number;
  color: string;
  grade_distribution: {
        grade_best_guess: string;
        route_count: number;
    }[];
  crags: Crag[];
}

export type ClimbingRoute = {
    id: string;
    name: string;
    grade_best_guess: string;
    fa_grade: string;
    length: number;
    bolts: number;
    pitches: number;
    approach: string;
    plain_description: string;
    descent: string;
    setters: string;
    fa_day: number;
    fa_month: number;
    fa_year: number;
    climbing_area: string;
    climbing_sector: string;
    wall_topo_ids: string[];
    detail_topo_ids: string[];
    wall_topo_numbers: number[];
}

export type Crag = {
    name: string;
}

export type AreaDetails = ClimbingArea & {
    
}

export type WallTopo = {
    id: string;
    name: string;
    description: string;
    details: string;
    extracted_filename: string;
    climbing_routes_ids: string[];
    climbing_area_name: string;
    climbing_sector: string;
    line_segments: Feature[];
}

export type Point = {
    type: "Point";
    coordinates: [number, number];
}

export type LineString = {
    type: "LineString";
    coordinates: [number, number][];
}

export type Feature = {
    type: "Feature";
    geometry: Point | LineString;
    properties: {
      line_label: number;
      filename: string;
      topo_id: string;
      deleting: boolean;
    }
}
