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

export type AreaDetails = ClimbingArea & {
    route_distribution: RouteDistribution;
}

export type RouteDistribution = {
    grade_best_guess: string;
    route_count: number;
}[];