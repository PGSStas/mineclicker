var isAnimationGoing = 0; // Идет ли сейчас анимация
var isAudioPlaying = false; // играет ли сейчас аудио
var damage = 1; // Урон игрока
var bioms; // Объект, содержащий все биомы и монстров
var XP = 0; // Опыт
var xpGoal = 1000; //Нужно для достижения 1 уровня
var xpCoef = 1.3 // Множитель увеличения количества опыта нужного для повышения уровня
var valCoef = 1.6 // Множитель увеличения цены апгрейдов
var curLevel = 1; // Текущий уровень
var curMob; // Текущий моб
var mob_sound;  //массив звуков моба
var HP, fullHP; // Текущее/ максимальное количество жизней моба
var coin = 0; // Количество монет
var moneyPerSec = 0; // Количество монет в секунду
var killStreak = 0; // Количество убитых монстров
var curId = 0; // Выбранный мир 
var notification_list = [], notification_displaying; //массив с уведомлениями и показывается ли уведомление сейчас
var ost = new Audio ('sounds/ost.ogg');

//Начальная загрузка 
window.addEventListener ("load", function () {
	makeList(tempUpgrades, document.getElementById("perhit"), 0);
	makeList(permanentUpgrades, document.getElementById("persec"), 1);
	createBioms();  
	changeMob(bioms[0].mobs[0], 0);
	xpBar();
	statUpdate();
	setTimeout(function(){
		document.getElementById("toRemove").style.opacity = "0";
		setTimeout (function () {
			document.getElementById("toRemove").style.display = 'none';
			notify("Добро пожаловать в Майнкрафт кликер!");
		}, 500);
		setInterval(function(){
			ost.play();
		}, 210*1000);
	}, 3900); //3900
});

//Обновление статистики
function statUpdate() {
	let curStat = '<div class="stat_block">У вас <br>' + curLevel + '<br>уровень</div><div class="stat_block">Ваш урон равен<br>' + damage + '</div><div class="stat_block">Количество опыта:<br>' + XP + '</div><div class="stat_block">Убито монстров:<br>' +
					killStreak + '</div><div class="stat_block">Ваши сбережения:<br>' + coin.toFixed(1) + 'g</div><div class="stat_block">Количество монет в секунду:<br>' + moneyPerSec.toFixed(1) + 'g</div>	'; 
	document.getElementById("stats").innerHTML = curStat;
	createBioms();
	xpBar();
}


//Смена моба
function changeMob(newMob, worldId) {
	curId = worldId;
	document.body.style.backgroundImage = 'url("' + bioms[worldId].picture + '")';
	curMob = newMob;
	HP = curMob.HP;

	let width = (HP / curMob.HP * 100); 
	document.getElementById("healthBar").style.width = Math.max(width, 0.0) + '%';
	document.getElementById("health_bar_number").innerHTML = HP;
	document.getElementById("current_mob_image").style.backgroundImage = 'url("' + curMob.picture +'")';
	document.getElementById("mob_image_mask").style.mask = 'url("' + curMob.picture +'")';

	mob_sound = [];
	if (curMob.sounds != undefined) {
		if (curMob.sounds.length != undefined) {
			for (var i = 0; i < curMob.sounds.length; i++) {
				mob_sound.push(new Audio(curMob.sounds[i]));
			}
		}
	}
	//обновляю аудиофайлы моба
};


//Составление списка апгрейдов
function makeList(object, parent, listType) {
	let n = object.length;
	for (let i = 0; i < n; i++) {
		let typeObject = document.createElement('div');
   		typeObject.className = "category";
		parent.appendChild(typeObject);
		typeObject.innerHTML = '<div class="info">' + object[i].name + '</div>'; 

		elemCount = object[i].items.length;

		for(let j = 0; j < elemCount; j++) {
			let curObject = document.createElement('div');
			curObject.className = "upgrade";
			let curUpgrade = '<div class="upgrade_photo_container">' + '<div class="upgrade_photo" style="background-image: url(' + '\'' + object[i].items[j].icon +  '\'' + ')"></div></div>' 
			+ '<div class="upgrade_description">' + '<h1>' + object[i].items[j].topName + '</h1><br>' + '<p>Дает ' + object[i].items[j].bonus + ' к урону за клик. Стоимость: ' + object[i].items[j].cost + 'g</p></div>';
			if(listType == 1) {
				curUpgrade = '<div class="upgrade_photo_container">' + '<div class="upgrade_photo" style="background-image: url(' + '\'' + object[i].items[j].icon +  '\'' + ')"></div></div>' 
							+ '<div class="upgrade_description">' + '<h1>' + object[i].items[j].topName + '</h1><br>' + '<p>Дает ' + object[i].items[j].bonus + 'g в секунду. Стоимость: ' 
							+ object[i].items[j].cost + 'g</p></div>';
			}
			curObject.innerHTML = curUpgrade;


			//Клик по объекту в магазине 
			curObject.onclick = function () {
				let local_i = j, elem = curObject, curText = curUpgrade, itemType = i;
				return function () {
					if(object[itemType].items[local_i].cost <= coin && !object[itemType].items[local_i].status) {
						coin -= object[itemType].items[local_i].cost;
						//0 - Список единовременных, 1 - бесконечных
						if(listType == 0) {
							let itemFromHtml = document.getElementsByClassName('item');
							object[itemType].items[local_i].status = true;	
							curText = '<div class="upgrade_photo_container">' + '<div class="upgrade_photo" style="background-image: url(\'img/upgrades/done.png\'' +')"></div></div>'
								+ '<div class="upgrade_description">' + '<h1>' + object[itemType].items[local_i].topName + '</h1><br>' + '<p>Куплено</p>';
							curObject.innerHTML = curText;
							curObject.style.backgroundColor = '#009432';
							object[itemType].cur = Math.max(object[itemType].cur, local_i);
							damage += object[itemType].items[local_i].bonus;
							if(itemType >= 1 && itemType <= 9) {
								if(object[itemType].cur == -1) {
									itemFromHtml[itemType - 1].style.backgroundImage = '';
								} else {
									itemFromHtml[itemType - 1].style.backgroundImage = 'url("' + object[itemType].items[object[itemType].cur].icon + '")';
								}
							}
						} else {
							object[itemType].items[local_i].cost = Math.round(object[itemType].items[local_i].cost * valCoef);
							curText = '<div class="upgrade_photo_container">' + '<div class="upgrade_photo" style="background-image: url(' + '\'' + object[i].items[j].icon +  '\'' + ')"></div></div>' 
									+ '<div class="upgrade_description">' + '<h1>' + object[i].items[j].topName + '</h1><br>' + '<p>Дает ' + object[i].items[j].bonus + 'g в секунду. Стоимость: ' 
									+ object[i].items[j].cost + 'g</p></div>';
							curObject.innerHTML = curText;
							object[itemType].cur++;
							moneyPerSec += object[itemType].items[local_i].bonus;
						}
						statUpdate();
					} else {
						notify('Данный апгрейд приобретен или вам не хватает средств');
					}
				};

			}();
			parent.appendChild(curObject);
		}
	}
};

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};

//Обработка клика
function reduceHP () {
	HP = Math.max(0, HP - damage);
	coin += damage;
	let width = (HP / curMob.HP * 100); 
	document.getElementById("healthBar").style.width = Math.max(width, 0.0) + '%';
	document.getElementById("health_bar_number").innerHTML = HP;
	//console.log("curHP: " + HP + " maxHP: " + curMob.HP);
	PlayMobHurt(); //проигрываю аудио удара

	if (!isAnimationGoing) {
		document.getElementById("current_mob_image").style.animationName = "mob_punch";
		isAnimationGoing = 1;
		setTimeout(function(){document.getElementById("current_mob_image").style.animationName = ""; isAnimationGoing = 0;}, 300);
	}
	if (HP == 0) {
		killStreak++;
		let xpReward = curMob.XP + Math.round(Math.random() * 7) - 3; 
		notify("Вы победили! Ваша награда: " + xpReward + " опыта");
		XP += xpReward;
		while (XP >= xpGoal) {
			curLevel++;
			notify("У вас новый уровень!");
			createBioms();
			XP -= xpGoal;
			xpGoal = Math.round(xpGoal * xpCoef);
		}
		changeMob(curMob, curId);
		xpBar();
	}
  	statUpdate();
};

//Запрет правой кнопки
document.oncontextmenu = cmenu; 
function cmenu() { 
	return false; 
}

//Обработка ежесекундного прироста
setInterval(function() {coin = round(coin +  moneyPerSec / 10, 1); statUpdate();}, 100);   

//Обработка опыта
function xpBar() {
	document.getElementById('player_level_2').style.width = XP / xpGoal * 100 + '%'
	document.getElementById('xp_text').innerHTML = XP + 'xp'; 
}

//проигрывает звук урона моба
function PlayMobHurt () {
	if (isAudioPlaying) return;
	if (mob_sound.length == 0) return;

	isAudioPlaying = true;
	setInterval (function () {
		isAudioPlaying = false;
	}, 1500);

	var mob_sound_index = Math.floor(Math.random()*100) % mob_sound.length;
	mob_sound[mob_sound_index].play();
};

//создаёт биомы
function createBioms () {
    var dom_bioms = document.getElementsByClassName("biom");
    for (var i = 0; i < bioms.length; i++) {
        if (curLevel >= bioms[i].level) {
            dom_bioms[i].style.backgroundImage = "url(" + bioms[i].picture + ")";
            dom_bioms[i].innerHTML = "";

            dom_bioms[i].onclick = function () {
                var local_i = i;
                return function () {
                    createMobList(local_i);
                };
            }();
        }
        else {
            dom_bioms[i].style.backgroundColor = "black";
            dom_bioms[i].innerHTML = "<p>lvl. " + bioms[i].level + "</p>";
            dom_bioms[i].onclick = function () {};
        }
    };
};

//создаёт мобов в меню выбора
function createMobList (biom_id) {
    var mobs_list = document.getElementById("mob_selection_container");
    mobs_list.style.display = "flex";
    mobs_list.onclick = function (obj) {
        var local_el = mobs_list;
        return function (obj) {
            if (obj.path[0] == local_el) {
                local_el.style.display = "none";
            }
        };
    }();

    mobs_list = document.getElementById("mob_selection");
    mobs_list.innerHTML = "";

    for (var i = 0; i < bioms[biom_id].mobs.length; i++) {
        var mob = document.createElement("div");
        mob.classList = ["mob"];
        if (curLevel >= bioms[biom_id].mobs[i].level) {
            mob.innerHTML = "<h1>" + bioms[biom_id].mobs[i].name + "</h1>";
            mob.innerHTML += "<div style=\"background-image: url(" + bioms[biom_id].mobs[i].picture + ");\"></div>";
            mob.innerHTML += "<p>lvl. " + bioms[biom_id].mobs[i].level + " </p>";
            mob.innerHTML += "<p>HP " + bioms[biom_id].mobs[i].HP + " </p>";
            mob.innerHTML += "<p>XP " + bioms[biom_id].mobs[i].XP + "</p>";
            mob.onclick = function () {
                var local_mob = bioms[biom_id].mobs[i];
                return function () {
                    var el = document.getElementById("mob_selection_container");
                    el.style.display = "none";
                    changeMob(local_mob, biom_id);
                };
            }();
        } 
        else {
            mob.innerHTML = "<h1>?</h1>";
            mob.innerHTML += "<div style=\"background-color: black;\"></div>";
            mob.innerHTML += "<p>???</p>";
        }
        mobs_list.appendChild(mob);
    }
};

//уведомления
function notify (text) {
    if (arguments.length > 0) {
        if (notification_list.indexOf(arguments[0]) == -1 && notification_list.length < 5) {
            notification_list.push(arguments[0]);
            console.log("pushed " + arguments[0], notification_list);
            setTimeout (function () {
                notify();
            }, 100);
        }
        return;
    }

    if (notification_displaying == true) return;
    if (notification_list.length == 0) return;

    var notification = document.getElementById("notification");
    notification.innerHTML = notification_list[0];
    notification.style.display = "block";
    notification_displaying = true;

    setTimeout(function () {
        notification.style.opacity = "1";
    }, 100);

    setTimeout(function () {
        notification.style.opacity = "0";
        setTimeout(function () {
            notification.style.display = "none";
            notification_list.splice(0, 1);
            notification_displaying = false;
            notify();
        }, 1100);
    }, 2000);
};