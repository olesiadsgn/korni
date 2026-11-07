/* Схема древа: позиции (POS), семьи (FAM), пары (COUPLES). */
const POS={prf:[5,0],
 nkf:[5,1],vrm:[6,1],afb:[13.1,1],npl:[1,1],nml:[2,1],
 aln:[4,2],ivv:[8,2],zhe:[9,2],ivp:[10.2,2],ama:[11.4,2],vbl:[12.6,2],abl:[13.6,2],mrk:[6,2],dmk:[7,2],klv:[3,2],trf:[5,2],alp:[0,2],mlp:[1,2],blp:[2,2],
 ana:[9,3],vas:[5,3],dmi:[7,3],olg:[8,3],vla:[10,3],mar:[11,3],olgi:[12,3],mxm:[6,3],
 pav:[5,4],vad:[6,4],ale:[7,4],zoy:[8,4],svp:[9,4],vvp:[10,4],pet:[11,4],ant:[12,4],
 dar:[7,5],yul:[8,5],iva:[9,5],tat:[11,5],kol:[12,5],kvp:[10,5],
 kos:[7,6],zhen:[8,6],mis:[9,6],ole:[10,6],alx:[11,6],sve:[12,6],ivn:[13,6]};
const FAM=[ /* parents (1 or 2) -> children */
 [["npl","nml"],["alp","mlp","blp","klv"]], [["prf"],["nkf"]],[["nkf","vrm"],["trf","mrk","dmk","aln"]],[["aln","klv"],["mxm","dmi"]],[["aln"],["vas"]],[["ivv","zhe"],["olg"]],[["dmi","olg"],["vad","ale"]],[["vla","mar"],["zoy","vvp"]],[["vvp"],["kvp"]],[["ivp","ama"],["vla","ana"]],[["vbl"],["mar"]],[["afb"],["vbl","abl"]],
 [["olgi"],["ant"]],[["vas"],["pav"]],[["ale","zoy"],["dar","yul"]],[["pet","ant"],["iva","tat"]],
 [["yul","iva"],["zhen","mis","ole"]],[["dar"],["kos"]],[["tat","kol"],["sve","ivn"]]];
const COUPLES=[["npl","nml"],["nkf","vrm"],["aln","klv"],["ivp","ama"],["ivv","zhe"],["dmi","olg"],["vla","mar"],["ale","zoy"],["pet","ant"],["yul","iva"],["ole","alx"],["tat","kol"],["svp","vvp"]];
/* Пол: m или f. Нужен для «родился/родилась» и родства. */
const G={npl:"m",nml:"f",alp:"m",mlp:"m",blp:"m",afb:"f",abl:"m",trf:"m",vbl:"m",prf:"m",nkf:"m",vrm:"f",mrk:"f",dmk:"m",klv:"f",mxm:"m",vvp:"m",svp:"f",kvp:"m",aln:"m",ivv:"m",zhe:"f",dmi:"m",olg:"f",vas:"m",vla:"m",mar:"f",olgi:"f",ivp:"m",ama:"f",ana:"m",pav:"m",vad:"m",ale:"m",zoy:"f",pet:"m",ant:"f",yul:"f",dar:"f",iva:"m",ole:"f",alx:"m",zhen:"f",mis:"m",kos:"m",tat:"f",kol:"m",sve:"f",ivn:"m"};
