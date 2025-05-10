export type ClimbingArea = {
  id: number;
  name: string;
  description: string;
  access: string;
  access_from_dahab_minutes: string;
  route_count: number;
  crags: string[];
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
    grade_distribution: {
        grade_best_guess: string;
        route_count: number;
    }[];
    crags: Crag[];
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
}
