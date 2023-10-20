package cz.incad.nkp.inprove.entities.calendar.manager;

import cz.incad.nkp.inprove.base.service.ManagerService;
import cz.incad.nkp.inprove.entities.calendar.Calendar;
import cz.incad.nkp.inprove.entities.calendar.CalendarRepo;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import cz.incad.nkp.inprove.entities.exemplar.ExemplarRepo;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CalendarManagerService implements ManagerService<Calendar> {

    @Getter
    private final CalendarRepo repo;
}
