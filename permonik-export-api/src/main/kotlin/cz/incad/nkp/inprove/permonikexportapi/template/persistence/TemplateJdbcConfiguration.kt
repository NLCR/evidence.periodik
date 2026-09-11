package cz.incad.nkp.inprove.permonikexportapi.template.persistence

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import cz.incad.nkp.inprove.permonikexportapi.template.PrimaryMainScan
import cz.incad.nkp.inprove.permonikexportapi.template.Replacement
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementMainScan
import org.postgresql.util.PGobject
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.data.convert.ReadingConverter
import org.springframework.data.convert.WritingConverter
import org.springframework.data.jdbc.core.convert.JdbcCustomConversions
import org.springframework.data.jdbc.core.dialect.JdbcDialect
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.json.JsonMapper

@Configuration(proxyBeanMethods = false)
class TemplateJdbcConfiguration {
    /** Registers JSONB storage without altering HTTP serialization or persisting frontend preview visibility. */
    @Bean
    fun jdbcCustomConversions(dialect: JdbcDialect, mapper: JsonMapper): JdbcCustomConversions {
        val storageMapper = mapper.rebuild()
            .addMixIn(PrimaryMainScan::class.java, WithoutPreviewState::class.java)
            .addMixIn(ReplacementMainScan::class.java, WithoutPreviewState::class.java)
            .addMixIn(Replacement::class.java, WithoutPreviewState::class.java)
            .build()
        return JdbcCustomConversions.of(dialect, listOf(
            TemplateContentWriter(storageMapper),
            TemplateContentReader(storageMapper),
        ))
    }
}

@JsonIgnoreProperties("visible")
private abstract class WithoutPreviewState

@WritingConverter
private class TemplateContentWriter(private val mapper: ObjectMapper) : Converter<TemplateContent, PGobject> {
    /** Encodes existing domain models as a single PostgreSQL JSONB value. */
    override fun convert(source: TemplateContent) = PGobject().apply {
        type = "jsonb"
        value = mapper.writeValueAsString(source)
    }
}

@ReadingConverter
private class TemplateContentReader(private val mapper: ObjectMapper) : Converter<PGobject, TemplateContent> {
    /** Reads the current persisted content format; incompatible documents fail rather than silently losing data. */
    override fun convert(source: PGobject): TemplateContent =
        mapper.readValue(requireNotNull(source.value), TemplateContent::class.java)
}
