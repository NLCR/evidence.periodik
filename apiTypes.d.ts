/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.37.1128 on 2024-05-13 15:02:05.

export interface Page<T> extends Slice<T> {
    totalPages: number;
    totalElements: number;
}

export interface ResetPasswordDto {
    id: string;
    oldheslo: string;
    newheslo: string;
}

export interface QueryDto {
    criteriaDtos: CriteriaBaseDto[];
    defaultRootOperation: NestedOperation;
    facetOptionsDto: FacetOptionsDto;
}

export interface CriteriaBetweenDto extends CriteriaBaseDto {
    field: string;
    operation: BetweenOperation;
    lower: any;
    upper: any;
}

export interface CriteriaEqualsDto extends CriteriaBaseDto {
    field: string;
    operation: EqualsOperation;
    value: any;
}

export interface CriteriaExpressionDto extends CriteriaBaseDto {
    field: string;
    operation: ExpressionOperation;
    expression: string;
}

export interface CriteriaInDto extends CriteriaBaseDto {
    field: string;
    operation: InOperation;
    values: any[];
}

export interface CriteriaNestedDto extends CriteriaBaseDto {
    operation: NestedOperation;
    children: CriteriaBaseDto[];
}

export interface CriteriaNotDto extends CriteriaBaseDto {
    negatedChild: CriteriaBaseDto;
    operation: NotOperation;
}

export interface CriteriaNullnessDto extends CriteriaBaseDto {
    field: string;
    operation: NullnessOperation;
}

export interface CriteriaNumberDto extends CriteriaBaseDto {
    field: string;
    operation: NumberOperation;
    value: any;
}

export interface CriteriaStringDto extends CriteriaBaseDto {
    field: string;
    operation: StringOperation;
    value: string;
}

export interface CriteriaBaseDto extends CriteriaVisitor {
}

export interface FacetOptionsDto {
    fields: string[];
    facetLimit: number;
    facetMinCount: number;
    facetSort: FacetSort;
    facetPrefix: string;
    pageable: Pageable;
}

export interface Calendar extends BaseEntity {
    type: string;
    title: string;
    year: number;
    month: number;
    day: number;
}

export interface Exemplar extends BaseEntity {
    id_issue: string;
    carovy_kod: string;
    numExists: boolean;
    carovy_kod_vlastnik: string;
    signatura: string;
    vlastnik: string;
    stav: string[];
    typ: string;
    stav_popis: string;
    pages: string;
    oznaceni: string;
    poznamka: string;
    nazev: string;
    podnazev: string;
    vydani: string;
    mutace: string;
    znak_oznaceni_vydani: string;
    datum_vydani: string;
    datum_vydani_str: string;
    datum_vydani_den: string;
    id_titul: string;
    periodicita: string;
    cislo: string;
    rocnik: string;
    cas_vydani: number;
    cas_vydani_str: string;
    state: string;
    meta_nazev: string;
    pocet_stran: number;
    druhe_cislo: number;
    isPriloha: boolean;
    digitalizovano: boolean;
    indextime: string;
    nazev_prilohy: string;
    pagesRange: string;
    popis_oznaceni_vydani: string;
    fyzicka_jednotka: string;
}

export interface MetaTitle extends BaseEntity {
    meta_nazev: string;
    meta_nazev_sort: string;
    meta_nazev_str: string;
    periodicita: string;
    poznamka: string;
    show_to_not_logged_users: boolean;
    uuid: string;
    pocet_stran: number;
}

export interface User extends BaseEntity, Serializable {
    email: string;
    username: string;
    nazev: string;
    role: string;
    active: boolean;
    poznamka: string;
    owner: string;
    indextime: Date;
}

export interface Volume extends BaseEntity {
    id_titul: string;
    signatura: string;
    mutace: string;
    periodicita: string[];
    poznamka: string;
    vlastnik: string;
    datum_od: string;
    datum_do: string;
    prvni_cislo: string;
    posledni_cislo: string;
    znak_oznaceni_vydani: string;
    carovy_kod: string;
    pocet_stran: number;
    show_attachments_at_the_end: boolean;
}

export interface Sort extends Streamable<Order>, Serializable {
    unsorted: boolean;
    sorted: boolean;
}

export interface Pageable {
    offset: number;
    sort: Sort;
    paged: boolean;
    unpaged: boolean;
    pageNumber: number;
    pageSize: number;
}

export interface CriteriaVisitor {
}

export interface BaseEntity {
    id: string;
}

export interface Serializable {
}

export interface Slice<T> extends Streamable<T> {
    size: number;
    content: T[];
    number: number;
    sort: Sort;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    pageable: Pageable;
}

export interface Streamable<T> extends Iterable<T>, Supplier<Stream<T>> {
    empty: boolean;
}

export interface Order extends Serializable {
    direction: Direction;
    property: string;
    ignoreCase: boolean;
    nullHandling: NullHandling;
    ascending: boolean;
    descending: boolean;
}

export interface Iterable<T> {
}

export interface Supplier<T> {
}

export interface Stream<T> extends BaseStream<T, Stream<T>> {
}

export interface BaseStream<T, S> extends AutoCloseable {
    parallel: boolean;
}

export interface AutoCloseable {
}

export type NestedOperation = "AND" | "OR";

export type BetweenOperation = "BETWEEN";

export type EqualsOperation = "EQ";

export type ExpressionOperation = "EXPRESSION";

export type InOperation = "IN";

export type NotOperation = "NOT";

export type NullnessOperation = "IS_NULL" | "IS_NOT_NULL";

export type NumberOperation = "LT" | "LTE" | "GT" | "GTE";

export type StringOperation = "CONTAINS" | "STARTS_WITH" | "ENDS_WITH";

export type FacetSort = "COUNT" | "INDEX";

export type Direction = "ASC" | "DESC";

export type NullHandling = "NATIVE" | "NULLS_FIRST" | "NULLS_LAST";
