export type ActionCategory = "logistica" | "passeio" | "comida" | "checklist";

export type TripAction = {
  _id?: string;
  tripSlug: string;
  dayKey: string;
  dayLabel: string;
  sort: number;
  time?: string;
  title: string;
  notes?: string;
  placeName?: string;
  placeUrl?: string;
  category: ActionCategory;
  done: boolean;
  seedKey?: string;
  custom: boolean;
};

export type TripDay = {
  key: string;
  label: string;
  weekday: string;
  focus: string;
};

export type Trip = {
  slug: string;
  title: string;
  subtitle: string;
  dates: string;
  days: TripDay[];
};
