package cz.incad.nkp.inprove.entities.calendar.search;

import cz.incad.nkp.inprove.base.service.BaseSearchService;
import cz.incad.nkp.inprove.entities.calendar.Calendar;
import cz.incad.nkp.inprove.entities.calendar.CalendarRepo;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@Getter
public class CalendarSearchService extends BaseSearchService<Calendar> {

    private final CalendarRepo repo;

    private final String solrCollection = Calendar.COLLECTION;

    private final Class<Calendar> clazz = Calendar.class;

}
