package cz.incad.nkp.inprove.permonikapi.specimen.mutationMark;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Getter
@Setter
public class MutationMark {
    private String mark;
    private MutationMarkTypeEnum type;
    private String description;
}
