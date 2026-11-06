/* Схема древа: позиции (POS), семьи (FAM), пары (COUPLES). */
const POS={aln:[1,0],ivv:[3,0],zhe:[4,0],ivp:[5.2,0],ama:[6.4,0],ana:[4,1],
 vas:[0,1],dmi:[2,1],olg:[3,1],vla:[5,1],mar:[6,1],olgi:[7,1],
 pav:[0,2],vad:[1,2],ale:[2,2],zoy:[3,2],svp:[4,2],vvp:[5,2],pet:[6,2],ant:[7,2],
 dar:[2,3],yul:[3,3],iva:[4,3],tat:[6,3],kol:[7,3],kvp:[5,3],
 kos:[2,4],zhen:[3,4],mis:[4,4],ole:[5,4],alx:[6,4],sve:[7,4],ivn:[8,4]};
const FAM=[ /* parents (1 or 2) -> children */
 [["aln"],["vas","dmi"]],[["ivv","zhe"],["olg"]],[["dmi","olg"],["vad","ale"]],[["vla","mar"],["zoy","vvp"]],[["vvp"],["kvp"]],[["ivp","ama"],["vla","ana"]],
 [["olgi"],["ant"]],[["vas"],["pav"]],[["ale","zoy"],["dar","yul"]],[["pet","ant"],["iva","tat"]],
 [["yul","iva"],["zhen","mis","ole"]],[["dar"],["kos"]],[["tat","kol"],["sve","ivn"]]];
const COUPLES=[["ivp","ama"],["ivv","zhe"],["dmi","olg"],["vla","mar"],["ale","zoy"],["pet","ant"],["yul","iva"],["ole","alx"],["tat","kol"],["svp","vvp"]];
/* Пол: m или f. Нужен для «родился/родилась» и родства. */
const G={vvp:"m",svp:"f",kvp:"m",aln:"m",ivv:"m",zhe:"f",dmi:"m",olg:"f",vas:"m",vla:"m",mar:"f",olgi:"f",ivp:"m",ama:"f",ana:"m",pav:"m",vad:"m",ale:"m",zoy:"f",pet:"m",ant:"f",yul:"f",dar:"f",iva:"m",ole:"f",alx:"m",zhen:"f",mis:"m",kos:"m",tat:"f",kol:"m",sve:"f",ivn:"m"};
