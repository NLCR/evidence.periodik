package cz.incad.nkp.inprove.permonikapi;

import cz.incad.nkp.inprove.permonikapi.audit.StoredDocument;
import cz.incad.nkp.inprove.permonikapi.edition.model.Edition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitle;
import cz.incad.nkp.inprove.permonikapi.mutation.model.Mutation;
import cz.incad.nkp.inprove.permonikapi.owner.Owner;
import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;
import jakarta.validation.Validation;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.xml.parsers.DocumentBuilderFactory;
import org.apache.solr.client.solrj.beans.Field;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Element;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SolrModelConstraintsTest {
    /** Keeps required model fields aligned with authoritative schemas, including inherited creation audit. */
    @Test
    void requiredFieldsMatchSolrSchemas() throws Exception {
        var models = Map.of("volume", Volume.class, "specimen", Specimen.class, "owner", Owner.class,
                "mutation", Mutation.class, "edition", Edition.class, "metatitle", MetaTitle.class);
        var factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        for (var entry : models.entrySet()) {
            var schema = factory.newDocumentBuilder().parse(Path.of("..", "permonik-database", "cores",
                    entry.getKey(), "conf", "managed-schema.xml").toFile());
            Set<String> expected = new HashSet<>();
            var fields = schema.getElementsByTagName("field");
            for (int i = 0; i < fields.getLength(); i++) {
                var field = (Element) fields.item(i);
                if ("true".equals(field.getAttribute("required"))) expected.add(field.getAttribute("name"));
            }
            Set<String> declared = new HashSet<>();
            for (Class<?> type = entry.getValue(); type != Object.class; type = type.getSuperclass()) {
                for (var field : type.getDeclaredFields()) {
                    var mapping = field.getAnnotation(Field.class);
                    if (mapping != null && field.isAnnotationPresent(NotNull.class)) declared.add(mapping.value());
                }
            }
            assertEquals(expected, declared, entry.getKey());
        }
    }

    /** Distinguishes absent booleans/counts from false/zero and keeps server audit out of form validation. */
    @Test
    void validatesStoredStateWithoutInventingScalarDefaults() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var specimen = new Specimen();
            var absent = validator.validate(specimen, StoredDocument.class).stream()
                    .map(violation -> violation.getPropertyPath().toString()).toList();
            assertTrue(absent.containsAll(Set.of("numExists", "numMissing", "pagesCount", "created", "createdBy")));
            specimen.setNumExists(false);
            specimen.setNumMissing(false);
            specimen.setPagesCount(0);
            var explicit = validator.validate(specimen, StoredDocument.class).stream()
                    .map(violation -> violation.getPropertyPath().toString()).toList();
            assertFalse(explicit.contains("numExists"));
            assertFalse(explicit.contains("numMissing"));
            assertFalse(explicit.contains("pagesCount"));
            assertTrue(validator.validate(new VolumeDTO()).isEmpty());
        }
    }
}
