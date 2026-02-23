export enum FieldsToReset {
  barCode,
  note,
  mutationId,
  mutationMark,
  ownerId,
  /* damage types */
  damagedPages, // poškozené strany (PP)
  missingPages, // chybí strany (ChS)
  missingNumber, // chybí číslo (ChCC)
  degradation, // degradace (Deg)
  wrongPagination, // chybna paginace (ChPag)
  wrongNumbering, // chybné číslování (ChCis)
  wrongBinding, // chybně svázáno (ChSv)
  censored, // cenzurováno (Cz)
  unreadableBinding, // nečitelně svázáno (NS)
  wrongDate, // chybné datum (ChDatum)
}

export const basicFieldsToReset: FieldsToReset[] = [
  FieldsToReset.barCode,
  FieldsToReset.note,
  FieldsToReset.mutationId,
  FieldsToReset.mutationMark,
  FieldsToReset.ownerId,
]

export const damageFieldsToReset: FieldsToReset[] = [
  FieldsToReset.damagedPages,
  FieldsToReset.missingPages,
  FieldsToReset.missingNumber,
  FieldsToReset.degradation,
  FieldsToReset.wrongPagination,
  FieldsToReset.wrongNumbering,
  FieldsToReset.wrongBinding,
  FieldsToReset.censored,
  FieldsToReset.unreadableBinding,
  FieldsToReset.wrongDate,
]
