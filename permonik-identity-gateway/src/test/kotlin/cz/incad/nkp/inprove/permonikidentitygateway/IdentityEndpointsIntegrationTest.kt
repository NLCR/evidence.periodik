package cz.incad.nkp.inprove.permonikidentitygateway

import com.nimbusds.jwt.SignedJWT
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService
import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserEntity
import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserRepository
import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserRole
import cz.incad.nkp.inprove.permonikidentitygateway.security.JwtService
import java.util.UUID
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.hasItem
import org.hamcrest.Matchers.not
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@SpringBootTest(
    properties =
        [
            "spring.datasource.url=jdbc:h2:mem:identity;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
            "spring.datasource.driver-class-name=org.h2.Driver",
            "spring.datasource.username=sa",
            "spring.datasource.password=",
            "spring.autoconfigure.exclude=org.springframework.boot.session.data.redis.autoconfigure.SessionDataRedisAutoConfiguration",
            "identity.jwt.secret=test-secret-with-at-least-thirty-two-bytes",
            "identity.dev-user.password=admin",
        ]
)
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class IdentityEndpointsIntegrationTest
@Autowired
constructor(
    private val mvc: MockMvc,
    private val users: UserRepository,
    private val identities: IdentityService,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
) {
    @AfterEach fun clearSecurityContext() = SecurityContextHolder.clearContext()

    @Test
    fun basicLoginCreatesSessionAndMeResponse() {
        val session = login("admin", "admin")

        mvc.get("/api/me") { this.session = session }
            .andExpect {
                status { isOk() }
                jsonPath("\$.username") { value("admin") }
                jsonPath("\$.role") { value("admin") }
                jsonPath("\$.authorities", hasItem("USER_WRITE"))
                jsonPath("\$.authorities", hasItem("REFERENCE_WRITE"))
                jsonPath("\$.authorities", hasItem("TEMPLATE_MANAGE"))
                jsonPath("\$.authorities", not(hasItem("VOLUME_READ")))
            }

        mvc.get("/api/user/list/all") { this.session = session }
            .andExpect {
                status { isOk() }
                jsonPath("\$[*].role", hasItem("admin"))
                content { string(not(containsString("password"))) }
            }
    }

    @Test
    fun updatingCurrentUserRefreshesSessionPrincipal() {
        val session = login("admin", "admin")
        val admin = requireNotNull(users.findByUsernameIgnoreCase("admin"))
        val ownerId = UUID.randomUUID().toString()

        mvc.put("/api/user/{id}", admin.id) {
                this.session = session
                with(csrf())
                contentType = MediaType.APPLICATION_JSON
                content =
                    """
                    {
                      "id": "${admin.id}",
                      "email": "${admin.email}",
                      "userName": "${admin.username}",
                      "firstName": "${admin.firstName}",
                      "lastName": "${admin.lastName}",
                      "role": "ADMIN",
                      "active": true,
                      "owners": ["$ownerId"]
                    }
                """
                        .trimIndent()
            }
            .andExpect { status { isOk() } }

        mvc.get("/api/me") { this.session = session }
            .andExpect {
                status { isOk() }
                jsonPath("\$.username") { value("admin") }
                jsonPath("\$.role") { value("admin") }
                jsonPath("\$.owners", hasItem(ownerId))
            }
    }

    @Test
    fun regularUserCannotListUsers() {
        if (users.findByUsernameIgnoreCase("reader") == null) {
            users.save(
                UserEntity(
                    username = "reader",
                    email = "reader@example.test",
                    firstName = "Regular",
                    lastName = "Reader",
                    role = UserRole.USER,
                    active = true,
                    passwordHash = passwordEncoder.encode("reader-password"),
                )
            )
        }

        val session = login("reader", "reader-password")
        mvc.get("/api/user/list/all") { this.session = session }
            .andExpect {
                status { isForbidden() }
            }
    }

    @Test
    fun digitalizationRoleOnlyGetsTemplatePermissions() {
        val user = saveUser("digitizer", UserRole.DIGITALIZATION)
        users.save(user.copy(passwordHash = passwordEncoder.encode("digitizer-password")))

        val session = login("digitizer", "digitizer-password")
        mvc.get("/api/me") { this.session = session }
            .andExpect {
                status { isOk() }
                jsonPath("\$.authorities", hasItem("TEMPLATE_MANAGE"))
                jsonPath("\$.authorities", not(hasItem("VOLUME_WRITE")))
                jsonPath("\$.authorities", not(hasItem("USER_READ")))
            }
    }

    @Test
    fun samlLoginReusesMigratedAccountByIssuerAndEppn() {
        val idp = "https://shibboleth.nkp.cz/idp/shibboleth"
        val migrated =
            saveUser("migrated@nkp.cz", UserRole.USER)
                .copy(
                    email = "old@nkp.cz",
                    samlIdpEntityId = idp,
                    samlEppn = "migrated@nkp.cz",
                )
        users.save(migrated)
        val userCount = users.count()

        val principal =
            identities.provisionSaml(
                idp,
                "MIGRATED@NKP.CZ",
                "Migrated",
                "User",
                "new@nkp.cz",
            )

        assertEquals(migrated.id, principal.id)
        assertEquals(userCount, users.count())
        assertEquals("new@nkp.cz", users.findByIdOrNull(requireNotNull(migrated.id))?.email)
    }

    @Test
    fun basicLoginRejectsMissingCsrfToken() {
        mvc.post("/api/auth/login/basic") {
                contentType = MediaType.APPLICATION_JSON
                content = """{"username":"admin","password":"admin"}"""
            }
            .andExpect { status { isForbidden() } }
    }

    @Test
    fun jwtUsesRequestedAudience() {
        val principal =
            IdentityPrincipal(
                UUID.randomUUID(),
                "jwt-user",
                "JWT",
                "User",
                "jwt-user@example.test",
                UserRole.DIGITALIZATION,
                emptyList(),
                true,
                listOf("TEMPLATE_MANAGE"),
            )

        val core = SignedJWT.parse(jwtService.create(principal, "permonik-core"))
        val export = SignedJWT.parse(jwtService.create(principal, "permonik-export"))

        assertEquals(listOf("permonik-core"), core.jwtClaimsSet.audience)
        assertEquals(listOf("permonik-export"), export.jwtClaimsSet.audience)
    }

    private fun login(username: String, password: String): MockHttpSession {
        val result =
            mvc.post("/api/auth/login/basic") {
                    with(csrf())
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"username":"$username","password":"$password"}"""
                }
                .andExpect { status { isOk() } }
                .andReturn()
        return result.request.getSession(false) as? MockHttpSession
            ?: error("Login did not create a MockHttpSession")
    }

    private fun saveUser(username: String, role: UserRole): UserEntity =
        users.findByUsernameIgnoreCase(username)
            ?: users.save(
                UserEntity(
                    username = username,
                    email = "$username@example.test",
                    firstName = "Test",
                    lastName = "User",
                    role = role,
                    active = true,
                )
            )
}
