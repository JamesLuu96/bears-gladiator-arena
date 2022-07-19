const formEl = document.querySelector("form")
const gameScreen = document.querySelector(".game-screen")
const startScreen = document.querySelector(".start-screen")
const playerNameEl = document.querySelector(".player-name")
const enemyNameEl = document.querySelector(".enemy .name")
const enemyPortraitEl = document.querySelector(".enemy .portrait img")
const enemyMaxHealthEl = document.querySelector(".enemy .healthStr")
const playerMaxHealthEl = document.querySelector(".player .healthStr")
const enemyHealthEl = document.querySelector(".enemy .health")
const playerHealthEl = document.querySelector(".player .health")
const attackEl = document.querySelector(".attack")
const runEl = document.querySelector(".run")
const alertEl = document.querySelector(".alert-screen")
const alertTextEl = document.querySelector(".alert-screen .text")
const alertButtonEl = document.querySelector(".alert-screen .alert-button")
const gameOptionsEl = document.querySelector(".game-options")
const playerShieldEl = document.querySelector(".shield")
const playerHitRecordEl = document.querySelector(".player .hit-record")
const enemyHitRecordEl = document.querySelector(".enemy .hit-record")


function getHpStr(target){
    if(target.shield){
        return `${target.hp}/${target.maxHp}(${target.shield})`
    }
    return `${target.hp}/${target.maxHp}`
}

function updateHpEl(target){
    target.maxHpEl.textContent = getHpStr(target)
    if(target.shield){
        target.hpEl.style.width = `${(target.hp / (target.maxHp + target.shield)) * 100}%`
    }else{
        target.hpEl.style.width = `${(target.hp / target.maxHp) * 100}%`
    }
    playerShieldEl.style.width = `${(player.shield / (player.maxHp + player.shield)) * 100}%`
    if(target.shield){
        console.log('HP %: ' + `${(target.hp / (target.maxHp + target.shield)) * 100}%`)
        console.log('SHIELD %: ' + `${(player.shield / (player.maxHp + player.shield)) * 100}%`)
    }
}


formEl.addEventListener("submit", (e)=>{
    e.preventDefault()
    newGame()
    player.name = playerNameEl.value
    startGame()
})

let player;
let enemies;

function newGame(){
    player = {
        maxHp: 200,
        hp: 200,
        attack: 10,
        accuracy: 3,
        gold: 0,
        name: "",
        defense: 3,
        hpEl: playerHealthEl,
        maxHpEl: playerMaxHealthEl,
        crit: 10,
        shield: 0,
        hitRecord: playerHitRecordEl
    }

    enemies = [
        {
            name: "baby-bear",
            maxHp: 50,
            hp: 50,
            attack: 20,
            accuracy: 5,
            gold: 35,
            link: "./assets/pics/baby-bear-1.jpg",
            hpEl: enemyHealthEl,
            maxHpEl: enemyMaxHealthEl,
            crit: 10,
            hitRecord: enemyHitRecordEl
        },
        {
            name: "mama-bear",
            maxHp: 120,
            hp: 120,
            attack: 30,
            accuracy: 5,
            gold: 35,
            link: "./assets/pics/mama-bear-1.jpg",
            hpEl: enemyHealthEl,
            maxHpEl: enemyMaxHealthEl,
            crit: 15,
            hitRecord: enemyHitRecordEl
        },
        {
            name: "papa-bear",
            maxHp: 350,
            hp: 350,
            attack: 40,
            accuracy: 5,
            gold: 100,
            link: "./assets/pics/papa-bear-1.jpg",
            hpEl: enemyHealthEl,
            maxHpEl: enemyMaxHealthEl,
            crit: 25,
            hitRecord: enemyHitRecordEl
        }
    ]
}

function noNullAnswers(promptStr){
    const answer = prompt(promptStr)
    if(answer){
        return answer
    }else{
        alert("That is not valid!")
        return noNullAnswers(promptStr)
    }
}

function thread () {
    let resolve, reject
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
    return [promise, resolve, reject]
  }
  
function customConfirm(trueConfirm, falseConfirm) {
    const [prompt, resolve] = thread()
    trueConfirm.addEventListener("click", _ => resolve(true), {once: true})
    falseConfirm.addEventListener("click", _ => resolve(false), {once: true})
    return prompt
}

function customAlert(trueConfirm){
    const [prompt, resolve] = thread()
    trueConfirm.addEventListener("click", _ => resolve(true), {once: true})
    return prompt
}

  
  

async function startGame(){
    document.querySelector(".player .name").textContent = player.name
    let run = false
    let dead = false
    for(let i = 0; i < enemies.length; i++){
        const currentEnemy = enemies[i]
        enemyNameEl.textContent = currentEnemy.name
        enemyPortraitEl.src = currentEnemy.link
        updateHpEl(currentEnemy)
        updateHpEl(player)
        startScreen.style.display = "none"
        gameScreen.style.display = "flex"
        playerHitRecordEl.innerHTML = ""
        enemyHitRecordEl.innerHTML = ""
        let myTurn = true
        await alertScreen(`A wild ${currentEnemy.name} has appeared!`)
        while(currentEnemy.hp > 0 && player.hp > 0){
            if(myTurn){
                gameOptionsEl.style.display = "block"
                await customConfirm(attackEl, runEl)
                    .then(async function(response){
                        gameOptionsEl.style.display = "none"
                        if(response){
                            await attack(player, currentEnemy, currentEnemy)
                        }else{
                            run = true
                            return
                        }
                    })
            }else{
                await attack(currentEnemy, player, currentEnemy)
            }
            if(run){
                break
            }
            myTurn = !myTurn
        }
        if(run){
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-7.jpg`
            await alertScreen("You ran!")
            break
        }else if(player.hp === 0){
            await alertScreen("You died! Game Over...")
            dead = true
            break
        }else{
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-5.jpg`
            const gold = Math.max(currentEnemy.gold + (80 - Math.floor((player.hp / player.maxHp) * 100)), currentEnemy.gold)
            console.log(gold)
            await alertScreen(`
            You defeated ${currentEnemy.name}!
            You gained ${gold} gold!
            `)
            player.gold += gold
            if(i < enemies.length - 1){
                await alertScreen('You entered the shop.')
                await shop()
            }
        }
    }
    if(!run && !dead){
        alertButtonEl.style.display = "none"
        await alertScreen("You win!")
    }
    gameScreen.style.display = "none"
    startScreen.style.display = "block"
}

async function alertScreen(text){
    alertTextEl.textContent = text
    alertEl.style.display = "block"
    await customAlert(alertButtonEl)
    .then(()=>{
        alertEl.style.display = "none"
    })
}

async function attack(attacker, target, currentEnemy){
    const miss = Math.floor(Math.random() * 100)
    let damage = 0
    if(miss > attacker.accuracy * 10){
        if(attacker.link){
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-2.jpg`
        }else{
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-7.jpg`
        }
        const missEl = document.createElement("i")
        missEl.className = "fa-solid fa-x miss-record"
        attacker.hitRecord.append(missEl)
        await alertScreen(`${attacker.name} missed!`)
        enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-1.jpg`
        return
    }
    const crit = Math.floor(Math.random() * 100)
    console.log(`attacker: ${attacker.name}; rolled a crit of: ${crit}/100 with a crit chance of ${attacker.crit}`)
    if(crit <= attacker.crit){
        console.log(`success!`)
        const min = Math.max((attacker.attack * 2) - 2, 0)
        const max = (attacker.attack * 2) + 2
        damage = Math.floor(Math.random() * (max - min + 1)) + min
        target.hp = Math.max(0, target.hp - damage)
        updateHpEl(target)
        if(attacker.link){
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-4.jpg`
        }else{
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-6.jpg`
        }
        const critEl = document.createElement("i")
        critEl.className = "fa-solid fa-certificate crit-record"
        attacker.hitRecord.append(critEl)
        await alertScreen(`
        ${attacker.name} hit ${target.name} with a critical strike of ${damage} damage!
        ${target.name} has ${target.hp} health remaining!
        `)
        enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-1.jpg`
    }else{
        const min = Math.max(attacker.attack - 2, 0)
        const max = attacker.attack + 5
        damage = Math.floor(Math.random() * (max - min + 1)) + min
        target.hp = Math.max(0, target.hp - damage)
        updateHpEl(target)
        if(attacker.link){
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-3.jpg`
        }else{
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-6.jpg`
        }
        const hitEl = document.createElement("i")
        hitEl.className = "fa-solid fa-o hit-record"
        attacker.hitRecord.append(hitEl)
        await alertScreen(`
        ${attacker.name} hit ${target.name} for ${damage} damage!
        ${target.name} has ${target.hp} health remaining!
        `)
        enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-1.jpg`
    }
}

const shopScreenEl = document.querySelector(".shop-screen")
const shopPlayerNameEl = document.querySelector(".shop-screen .player-name")
const shopPlayerHealthEl = document.querySelector(".player-health span")
const shopPlayerStrengthEl = document.querySelector(".player-strength span")
const shopPlayerAccuracyEl = document.querySelector(".player-accuracy span")
const shopPlayerCritEl = document.querySelector(".player-crit span")
const shopPlayerGoldEl = document.querySelector(".player-gold span")

function updatePlayerEl(){
    if(player.accuracy === 10){
        shopUpgradeAccuracy.style.display = 'none'
    }else{
        shopUpgradeAccuracy.style.display = 'block'
    }
    if(player.crit === 100){
        shopUpgradeCrit.style.display = 'none'
    }else{
        shopUpgradeCrit.style.display = 'block'
    }
    shopPlayerNameEl.textContent = player.name
    shopPlayerHealthEl.textContent = `${player.hp}/${player.maxHp}`
    shopPlayerStrengthEl.textContent = player.attack
    shopPlayerAccuracyEl.textContent = `${player.accuracy * 10}%`
    shopPlayerCritEl.textContent = `${player.crit}%`
    shopPlayerGoldEl.textContent = player.gold
}

const nextBattleButtonEl = document.querySelector('.next-battle')

async function shop(){
    updatePlayerEl()
    gameScreen.style.display = "none"
    shopScreenEl.style.display = "flex"
    await customAlert(nextBattleButtonEl)
    .then(()=>{
        shopScreenEl.style.display = "none"

    })
}

const shopUpgradeHealth = document.querySelector('.shop-upgrade-health')
const shopUpgradeStrength = document.querySelector('.shop-upgrade-strength')
const shopUpgradeAccuracy = document.querySelector('.shop-upgrade-accuracy')
const shopUpgradeCrit = document.querySelector('.shop-upgrade-crit')

function checkGold(amount){
    if(player.gold < amount){
        return false
    }
    return true
}

shopUpgradeHealth.addEventListener("click", (e)=>{
    e.preventDefault()
    if(checkGold(10) && player.hp < player.maxHp){
        player.hp = Math.min(player.maxHp, player.hp + 40)
        player.gold -= 10
        updatePlayerEl()
    }
})

shopUpgradeStrength.addEventListener("click", (e)=>{
    e.preventDefault()
    if(checkGold(10)){
        player.attack += 5
        player.gold -= 10
        updatePlayerEl()
    }
})

shopUpgradeAccuracy.addEventListener("click", (e)=>{
    e.preventDefault()
    if(checkGold(5)){
        player.accuracy += 1
        player.gold -= 5
        updatePlayerEl()
    }
})

shopUpgradeCrit.addEventListener("click", (e)=>{
    e.preventDefault()
    if(checkGold(5)){
        player.crit += 10
        player.gold -= 5
        updatePlayerEl()
    }
})


// function shop(){
//     const option = prompt(`
//     Name: ${player.name}
//     Gold: ${player.gold}
//     1. Health: ${player.hp} (10G)
//     2. Strength: ${player.attack} (10G)
//     3. Dexterity: ${player.accuracy} (2G)
//     4: Leave Shop
// `)
//     console.log(option)
//     switch (option?.toLowerCase()){
//         case "1":
//         case "potion":
//             if(player.gold < 10){
//                 alert("You don't have enough gold!")
//                 return shop()
//             }else if(player.hp === player.maxHp){
//                 alert("You have max health already!")
//                 return shop()
//             }else{
//                 player.hp = Math.min(player.maxHp, player.hp + 10)
//                 player.gold -= 10
//                 return shop()
//             }
//         case "2":
//         case "str": 
//         case "strength":
//             if(player.gold < 10){
//                 alert("You don't have enough gold!")
//                 return shop()
//             }
//             player.attack += 5
//             player.gold -= 10
//             return shop()
//         case "3":
//         case "dex":
//         case "dexterity":
//             if(player.gold < 2){
//                 alert("You don't have enough gold!")
//                 return shop()
//             }
//             player.accuracy += 3
//             player.gold -= 2
//             return shop()
//         case "4":
//         case "leave":
//         default:
//             const choice = confirm(`Are you sure you want to leave?`)
//             if(!choice){
//                 return shop()
//             }
//             break
//     }
// }