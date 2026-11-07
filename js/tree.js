/* Схема древа: позиции (POS), семьи (FAM), пары (COUPLES). */
const POS={prf:[1.5,0],
 nkf:[1.5,1],vrm:[2.5,1],
 aln:[2,2],ivv:[4,2],zhe:[5,2],ivp:[6.2,2],ama:[7.4,2],mrk:[0,2],dmk:[1,2],klv:[3,2],
 ana:[5,3],vas:[1,3],dmi:[3,3],olg:[4,3],vla:[6,3],mar:[7,3],olgi:[8,3],mxm:[2,3],
 pav:[1,4],vad:[2,4],ale:[3,4],zoy:[4,4],svp:[5,4],vvp:[6,4],pet:[7,4],ant:[8,4],
 dar:[3,5],yul:[4,5],iva:[5,5],tat:[7,5],kol:[8,5],kvp:[6,5],
 kos:[3,6],zhen:[4,6],mis:[5,6],ole:[6,6],alx:[7,6],sve:[8,6],ivn:[9,6]};
const FAM=[ /* parents (1 or 2) -> children */
 [["prf"],["nkf"]],[["nkf","vrm"],["mrk","dmk","aln"]],[["aln","klv"],["mxm","dmi"]],[["aln"],["vas"]],[["ivv","zhe"],["olg"]],[["dmi","olg"],["vad","ale"]],[["vla","mar"],["zoy","vvp"]],[["vvp"],["kvp"]],[["ivp","ama"],["vla","ana"]],
 [["olgi"],["ant"]],[["vas"],["pav"]],[["ale","zoy"],["dar","yul"]],[["pet","ant"],["iva","tat"]],
 [["yul","iva"],["zhen","mis","ole"]],[["dar"],["kos"]],[["tat","kol"],["sve","ivn"]]];
const COUPLES=[["nkf","vrm"],["aln","klv"],["ivp","ama"],["ivv","zhe"],["dmi","olg"],["vla","mar"],["ale","zoy"],["pet","ant"],["yul","iva"],["ole","alx"],["tat","kol"],["svp","vvp"]];
/* Пол: m или f. Нужен для «родился/родилась» и родства. */
const G={prf:"m",nkf:"m",vrm:"f",mrk:"f",dmk:"m",klv:"f",mxm:"m",vvp:"m",svp:"f",kvp:"m",aln:"m",ivv:"m",zhe:"f",dmi:"m",olg:"f",vas:"m",vla:"m",mar:"f",olgi:"f",ivp:"m",ama:"f",ana:"m",pav:"m",vad:"m",ale:"m",zoy:"f",pet:"m",ant:"f",yul:"f",dar:"f",iva:"m",ole:"f",alx:"m",zhen:"f",mis:"m",kos:"m",tat:"f",kol:"m",sve:"f",ivn:"m"};
