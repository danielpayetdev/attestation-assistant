export class Motif {

    private static COURSES = new Motif("courses", "achat");
    private static TRAVAIL = new Motif("travail", "travailler", "boulot")
    private static SANTE = new Motif("sante", "médecin", "docteur");
    private static FAMILLE = new Motif("famille", "familliale");
    private static SPORT = new Motif("sport");
    private static JUDICIAIRE = new Motif("judiciaire");
    private static MISSIONS = new Motif("missions", "intérêt général");
    private static MOTIF: Motif[] = [Motif.COURSES, Motif.TRAVAIL, Motif.SANTE, Motif.FAMILLE, Motif.SPORT, Motif.JUDICIAIRE, Motif.MISSIONS];

    private alias: string[] = [];
    private valeur: string;
    constructor(valeur: string, ...alias: string[]) {
        this.valeur = valeur;
        this.alias.push(...alias);
    }

    public static of(text: string): string | undefined {
        return Motif.MOTIF.find((motif) => {
            const motifs = [motif.valeur, ...motif.alias];
            return motifs.some((m) => text.includes(m));
        })?.valeur;
    }
}