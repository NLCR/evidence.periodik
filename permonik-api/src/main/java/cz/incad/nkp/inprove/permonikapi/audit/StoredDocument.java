package cz.incad.nkp.inprove.permonikapi.audit;

import jakarta.validation.groups.Default;

/** Validates a complete stored document, including server-owned creation audit, not an incoming form. */
public interface StoredDocument extends Default {
}
