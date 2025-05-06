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
    id: number;
    name: string;
    grade_best_guess: string;
    length: number;
    description: string;
    climbing_area: string; 
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

export type NewClimbingRoute = {
    name: string;
    grade: string;
    length: number;
    bolts: number;
    info: string;
    area: string;
    crag: string;
    setters: string;
};

export type WallTopo = {
    name: string;
    extracted_filename: string;
    climbing_routes_ids: string[];
}
