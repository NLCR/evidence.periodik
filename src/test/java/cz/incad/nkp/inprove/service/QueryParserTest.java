package cz.incad.nkp.inprove.service;

import cz.incad.nkp.inprove.base.BaseEntity;
import cz.incad.nkp.inprove.base.TestBase;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import cz.incad.nkp.inprove.parser.dto.QueryDto;
import cz.incad.nkp.inprove.parser.dto.criteria.*;
import org.assertj.core.api.ListAssert;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.core.query.*;

import java.util.*;
import java.util.stream.Collectors;

import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaBetweenDto.BetweenOperation.BETWEEN;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaEqualsDto.EqualsOperation.EQ;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaExpressionDto.ExpressionOperation.EXPRESSION;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaInDto.InOperation.IN;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNestedDto.NestedOperation.AND;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNestedDto.NestedOperation.OR;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNotDto.NotOperation.NOT;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNullnessDto.NullnessOperation.IS_NOT_NULL;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNullnessDto.NullnessOperation.IS_NULL;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNumberDto.NumberOperation.*;
import static cz.incad.nkp.inprove.parser.dto.criteria.CriteriaStringDto.StringOperation.*;
import static org.assertj.core.api.Assertions.assertThat;

class QueryParserTest extends TestBase {

    private static List<Arguments> criteriaParsingTests() {
        List<Arguments> args = new ArrayList<>();

        // SEPARATED TESTS FOR EACH CRITERIA OPERATION

        args.add(Arguments.of("Between", true, new QueryDto(
                new CriteriaBetweenDto("pocet_stran", BETWEEN, 3, 6))));

        args.add(Arguments.of("Equals", true, new QueryDto(
                new CriteriaEqualsDto("nazev", EQ, "testexemplar"))));

        args.add(Arguments.of("Expression", true, new QueryDto(
                new CriteriaExpressionDto("nazev", EXPRESSION, "*exe*"))));

        args.add(Arguments.of("In", true, new QueryDto(
                new CriteriaInDto("nazev", IN, Arrays.asList("aha", "testexemplar", "gsgs")))));

        args.add(Arguments.of("And", true, new QueryDto(
                new CriteriaNestedDto(AND, Arrays.asList(
                        new CriteriaStringDto("nazev", CONTAINS, "ste"),
                        new CriteriaNumberDto("pocet_stran", LT, 6)
                )))));
        args.add(Arguments.of("Or", true, new QueryDto(
                new CriteriaNestedDto(OR, Arrays.asList(
                        new CriteriaStringDto("nazev", CONTAINS, "nothing"),
                        new CriteriaNumberDto("pocet_stran", LT, 6)
                )))));

        args.add(Arguments.of("Not", false, new QueryDto(
                new CriteriaNotDto(new CriteriaEqualsDto("nazev", EQ, "testexemplar"), NOT))));

        args.add(Arguments.of("Is null", false, new QueryDto(
                new CriteriaNullnessDto("nazev", IS_NULL))));
        args.add(Arguments.of("Is not null", true, new QueryDto(
                new CriteriaNullnessDto("nazev", IS_NOT_NULL))));

        args.add(Arguments.of("Greater than", true, new QueryDto(
                new CriteriaNumberDto("pocet_stran", GT, 4))));
        args.add(Arguments.of("Greater than equals", true, new QueryDto(
                new CriteriaNumberDto("pocet_stran", GTE, 5))));
        args.add(Arguments.of("Less than", true, new QueryDto(
                new CriteriaNumberDto("pocet_stran", LT, 6))));
        args.add(Arguments.of("Less than equals", true, new QueryDto(
                new CriteriaNumberDto("pocet_stran", LTE, 5))));

        args.add(Arguments.of("Contains", true, new QueryDto(
                new CriteriaStringDto("nazev", CONTAINS, "ste"))));
        args.add(Arguments.of("Starts with", true, new QueryDto(
                new CriteriaStringDto("nazev", STARTS_WITH, "tes"))));
        args.add(Arguments.of("Ends with", true, new QueryDto(
                new CriteriaStringDto("nazev", ENDS_WITH, "lar"))));

        // MORE COMPLEX TESTS

        args.add(Arguments.of("More than one in root with default AND", true, new QueryDto(Arrays.asList(
                new CriteriaBetweenDto("pocet_stran", BETWEEN, 3, 6),
                new CriteriaEqualsDto("nazev", EQ, "testexemplar"
                )))));

        args.add(Arguments.of("More than one in root with OR", true, new QueryDto(Arrays.asList(
                new CriteriaBetweenDto("pocet_stran", BETWEEN, 1, 2),
                new CriteriaEqualsDto("nazev", EQ, "testexemplar")),
                OR)));

        CriteriaNestedDto criteriaAndNestedDto = new CriteriaNestedDto(AND, Arrays.asList(
                new CriteriaStringDto("nazev", CONTAINS, "ste"),
                new CriteriaNumberDto("pocet_stran", LT, 6)
        ));
        CriteriaNestedDto criteriaComplexOrNestedDto = new CriteriaNestedDto(OR, Arrays.asList(
                new CriteriaStringDto("nazev", CONTAINS, "nothing"),
                new CriteriaNotDto(criteriaAndNestedDto, NOT),
                new CriteriaNumberDto("pocet_stran", LT, 6)
        ));
        args.add(Arguments.of("complex query", true, new QueryDto(Arrays.asList(
                new CriteriaBetweenDto("pocet_stran", BETWEEN, 3, 6),
                criteriaAndNestedDto,
                new CriteriaEqualsDto("nazev", EQ, "testexemplar"),
                new CriteriaInDto("nazev", IN, Arrays.asList("aha", "testexemplar", "gsgs")),
                criteriaComplexOrNestedDto,
                new CriteriaNumberDto("pocet_stran", GTE, 5),
                new CriteriaStringDto("nazev", ENDS_WITH, "lar"),
                new CriteriaNullnessDto("nazev", IS_NOT_NULL)
        ))));

        return args;
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource
    void criteriaParsingTests(String testName, Boolean shouldBeFound, QueryDto queryDto) {
        Exemplar exemplar = getSampleExemplar();

        Criteria criteria = criteriaDtoParser.parseCriteria(queryDto);
        List<Exemplar> returnedExemplar = query(criteria, exemplar, Exemplar.COLLECTION, Exemplar.class);

        if (shouldBeFound) {
            assertThat(returnedExemplar).isNotEmpty();
        } else {
            assertThat(returnedExemplar).isEmpty();
        }
    }

    private <T extends BaseEntity> List<T> query(Criteria criteria, T entity, String collection, Class<T> clazz) {
        return solrTemplate.query(collection, new SimpleQuery(criteria, Pageable.ofSize(Integer.MAX_VALUE)), clazz)
                .getContent()
                .stream().filter(e -> e.equals(entity)).collect(Collectors.toList());
    }
}