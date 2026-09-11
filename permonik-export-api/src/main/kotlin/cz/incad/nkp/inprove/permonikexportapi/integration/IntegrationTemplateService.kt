package cz.incad.nkp.inprove.permonikexportapi.integration

fun interface IntegrationTemplateService {
    /** Returns the public integration projection of a finalized template identified by barcode. */
    fun getByBarcode(barcode: String): IntegrationTemplate
}
