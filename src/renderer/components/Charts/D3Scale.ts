import { ScaleBand } from "d3-scale";
import { Domain } from "domain";
import { Area, Symbol } from "d3-shape";


type Modify<T, R> = Omit<T, keyof R> & R;

export type DefinedScaleBand<Domain extends { toString(): string }> = Modify<ScaleBand<Domain>, {
    /**
     * Given a value in the input domain, returns the start of the corresponding band derived from the output range.
     * If the given value is not in the scale’s domain, returns undefined.
     * 
     * Here we remove the undefined return type to ensure that the function always returns a number.
     *
     * @param x  A value from the domain.
     */
    (x: Domain): number;
}>;

export type DefinedSymbol<This, Datum> = Modify<Symbol<This, Datum>, {
    /**
     * Generates a symbol for the given arguments.
     *
     * IMPORTANT: If the rendering context of the symbol generator is null,
     * then the symbol is returned as a path data string.
     *
     * The "this" context within which this function is invoked, will be the context within which the accessor methods of the generator are invoked.
     * All arguments passed into this function, will be passed to the accessor functions of the generator.
     *
     * For example, with the default settings, no arguments are needed to produce a circle with area 64 square pixels.
     * 
     * Here we remove the null return type to ensure that the function always returns a string.
     *
     * @param d The datum for which the symbol is to be generated.
     */
    (this: This, d?: Datum, ...args: any[]): string;
}>

export type DefinedArea<Datum> = Modify<Area<Datum>, {
    /**
     * Generates an area for the given array of data. Depending on this area generator’s associated curve,
     * the given input data may need to be sorted by x-value before being passed to the area generator.
     *
     * IMPORTANT: If the rendering context of the area generator is null,
     * then the area is returned as a path data string.
     * 
     * Here we remove the null return type to ensure that the function always returns a string.
     *
     * @param data Array of data elements.
     */
    (data: Iterable<Datum> | Datum[]): string;
}>