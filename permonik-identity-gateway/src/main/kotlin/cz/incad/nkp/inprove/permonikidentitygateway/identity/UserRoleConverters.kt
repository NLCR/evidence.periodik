package cz.incad.nkp.inprove.permonikidentitygateway.identity

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.data.convert.ReadingConverter
import org.springframework.data.convert.WritingConverter
import org.springframework.data.jdbc.core.convert.JdbcCustomConversions
import org.springframework.data.jdbc.core.dialect.JdbcDialect
import org.springframework.data.jdbc.core.mapping.JdbcMappingContext
import org.springframework.data.jdbc.repository.config.JdbcConfiguration as SpringJdbcConfiguration
import org.springframework.data.relational.RelationalManagedTypes

@WritingConverter
object UserRoleWritingConverter : Converter<UserRole, String> {
    override fun convert(source: UserRole): String = source.value
}

@ReadingConverter
object UserRoleReadingConverter : Converter<String, UserRole> {
    override fun convert(source: String): UserRole = source.toUserRole()
}

@Configuration
class JdbcConfiguration {
    @Bean
    fun jdbcCustomConversions(dialect: JdbcDialect): JdbcCustomConversions =
        JdbcCustomConversions.of(
            dialect,
            listOf(UserRoleWritingConverter, UserRoleReadingConverter),
        )

    @Bean
    fun jdbcMappingContext(
        customConversions: JdbcCustomConversions,
        jdbcManagedTypes: RelationalManagedTypes,
    ): JdbcMappingContext =
        SpringJdbcConfiguration.createMappingContext(jdbcManagedTypes, customConversions, null)
            .apply { isForceQuote = false }
}
