package cz.incad.nkp.inprove.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.module.jdk8.Jdk8Module;
import org.modelmapper.module.jsr310.Jsr310Module;
import org.modelmapper.spi.MappingContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
public class ModelMapperConfig {

    @Bean
    @Primary
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setCollectionsMergeEnabled(false);
        modelMapper.getConfiguration().setSkipNullEnabled(false);
        modelMapper.getConfiguration().setDeepCopyEnabled(true);

        modelMapper.registerModule(new Jsr310Module());
        modelMapper.registerModule(new Jdk8Module());

        return modelMapper;
    }
}
