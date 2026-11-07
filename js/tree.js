/* Схема древа: позиции (POS), семьи (FAM), пары (COUPLES). */
const POS={prf:[1,0],
 nkf:[1,1],vrm:[2,1],
 aln:[3,2],ivv:[5,2],zhe:[6,2],ivp:[7.2,2],ama:[8.4,2],vbl:[9.6,2],mrk:[1,2],dmk:[2,2],klv:[4,2],trf:[0,2],
 ana:[6,3],vas:[2,3],dmi:[4,3],olg:[5,3],vla:[7,3],mar:[8,3],olgi:[9,3],mxm:[3,3],
 pav:[2,4],vad:[3,4],ale:[4,4],zoy:[5,4],svp:[6,4],vvp:[7,4],pet:[8,4],ant:[9,4],
 dar:[4,5],yul:[5,5],iva:[6,5],tat:[8,5],kol:[9,5],kvp:[7,5],
 kos:[4,6],zhen:[5,6],mis:[6,6],ole:[7,6],alx:[8,6],sve:[9,6],ivn:[10,6]};
const FAM=[ /* parents (1 or 2) -> children */
 [["prf"],["nkf"]],[["nkf","vrm"],["trf","mrk","dmk","aln"]],[["aln","klv"],["mxm","dmi"]],[["aln"],["vas"]],[["ivv","zhe"],["olg"]],[["dmi","olg"],["vad","ale"]],[["vla","mar"],["zoy","vvp"]],[["vvp"],["kvp"]],[["ivp","ama"],["vla","ana"]],[["vbl"],["mar"]],
 [["olgi"],["ant"]],[["vas"],["pav"]],[["ale","zoy"],["dar","yul"]],[["pet","ant"],["iva","tat"]],
 [["yul","iva"],["zhen","mis","ole"]],[["dar"],["kos"]],[["tat","kol"],["sve","ivn"]]];
const COUPLES=[["nkf","vrm"],["aln","klv"],["ivp","ama"],["ivv","zhe"],["dmi","olg"],["vla","mar"],["ale","zoy"],["pet","ant"],["yul","iva"],["ole","alx"],["tat","kol"],["svp","vvp"]];
/* Пол: m или f. Нужен для «родился/родилась» и родства. */
const G={trf:"m",vbl:"m",prf:"m",nkf:"m",vrm:"f",mrk:"f",dmk:"m",klv:"f",mxm:"m",vvp:"m",svp:"f",kvp:"m",aln:"m",ivv:"m",zhe:"f",dmi:"m",olg:"f",vas:"m",vla:"m",mar:"f",olgi:"f",ivp:"m",ama:"f",ana:"m",pav:"m",vad:"m",ale:"m",zoy:"f",pet:"m",ant:"f",yul:"f",dar:"f",iva:"m",ole:"f",alx:"m",zhen:"f",mis:"m",kos:"m",tat:"f",kol:"m",sve:"f",ivn:"m"};
