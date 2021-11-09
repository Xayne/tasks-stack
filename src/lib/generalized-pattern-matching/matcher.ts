import { Maybe } from "../fp-essentials/data/maybe";

export type Matcher<f, t> = (f: f) => Maybe<t>
