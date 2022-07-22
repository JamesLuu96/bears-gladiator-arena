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
const shieldGameEl = document.querySelector('.shield-game')

let missInRow = 0
let firstBoss = true

let shield = 0

shieldGameEl.addEventListener('click', ()=>{
    shield++
})




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
let run;

function newGame(){
    player = {
        maxHp: 200,
        hp: 200,
        attack: 10,
        accuracy: 30,
        gold: 0,
        name: "",
        defense: 3,
        hpEl: playerHealthEl,
        maxHpEl: playerMaxHealthEl,
        crit: 10,
        shield: 0,
        hitRecord: playerHitRecordEl,
        moves: [
            {
                element: "attack", 
                result: async function(currentEnemy){
                    await attack(player, currentEnemy, currentEnemy)
                },
                cooldown: 0,
                onCooldown: 0
            },
            {
                element: "shield", 
                result: async function(currentEnemy){
                    shield = 0
                    shieldGameEl.style.display = 'block'
                    await wait(1500)
                    shieldGameEl.style.display = 'none'
                    player.shield += shield * 5
                    updateHpEl(player)
                    const shieldEl = document.createElement("i")
                    shieldEl.className = "fa-solid fa-shield-halved shield-record"
                    player.hitRecord.append(shieldEl)
                    await alertScreen(`You gained ${shield * 5} shield!`)
                },
                cooldown: 3,
                onCooldown: 2
            },
            {
                element: "hail mary", 
                result: async function(currentEnemy){
                    const attackBuff = Math.floor(player.attack * 2)
                    const accuracyDebuff = Math.floor(player.accuracy / 2)
                    player.attack += attackBuff
                    player.accuracy -= accuracyDebuff
                    await attack(player, currentEnemy, currentEnemy, true)
                    player.attack -= attackBuff
                    player.accuracy += accuracyDebuff
                },
                cooldown: 2,
                onCooldown: 0
            },
        ]
    }

    enemies = [
        {
            name: "baby-bear",
            maxHp: 50,
            hp: 50,
            attack: 20,
            accuracy: 50,
            gold: 35,
            link: "./assets/pics/baby-bear-1.png",
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
            accuracy: 50,
            gold: 35,
            link: "./assets/pics/mama-bear-1.png",
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
            accuracy: 50,
            gold: 100,
            link: "./assets/pics/papa-bear-1.png",
            hpEl: enemyHealthEl,
            maxHpEl: enemyMaxHealthEl,
            crit: 25,
            hitRecord: enemyHitRecordEl,
            rest: 1
        }
    ]
}

function wait(ms){
    return new Promise(resolve =>{
        setTimeout(()=>{
            resolve()
        }, ms)
    })
}

function thread () {
    let resolve, reject
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
    return [promise, resolve, reject]
  }
  
function playerMoveSelection(moves) {
    const [prompt, resolve] = thread()
    gameOptionsEl.innerHTML = ""
    for(let i = 0; i < moves.length; i++){
        const currentMove = moves[i]
        const buttonEl = document.createElement('button')
        buttonEl.className = "click"
        buttonEl.textContent = currentMove.element
        if(currentMove.onCooldown > 0){
            buttonEl.dataset.onCooldown = `Cooldown: ${currentMove.onCooldown}`
            console.log(`${currentMove.element} is on cooldown for ${currentMove.onCooldown} turns!`)
            currentMove.onCooldown -= 1
        }else{
            buttonEl.addEventListener("click", _ => {
                currentMove.onCooldown += currentMove.cooldown
                return resolve({result: currentMove.result})
            }, {once: true})
        }
        gameOptionsEl.append(buttonEl)
    }
    return prompt
}

function customAlert(trueConfirm){
    const [prompt, resolve] = thread()
    trueConfirm.addEventListener("click", _ => resolve(true), {once: true})
    return prompt
}

async function startGame(){
    document.querySelector(".player .name").textContent = player.name
    run = false
    let dead = false
    missInRow = 0
    firstBoss = true
    for(let i = 0; i < enemies.length; i++){
        const currentEnemy = enemies[i]
        enemyNameEl.textContent = currentEnemy.name
        enemyPortraitEl.src = currentEnemy.link
        console.log({currentEnemy})
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
                await playerMoveSelection(player.moves)
                    .then(async function(response){
                        console.log({response})
                        gameOptionsEl.style.display = "none"
                        await response.result(currentEnemy)
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
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-7.png`
            await alertScreen("You ran!")
            break
        }else if(player.hp === 0){
            await alertScreen("You died! Game Over...")
            dead = true
            break
        }else{
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-5.png`
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

async function attack(attacker, target, currentEnemy, hailMary){
    console.log(`Accuracy: ${attacker.accuracy}`)
    const miss = Math.floor(Math.random() * 100)
    let damage = 0
    console.log(attacker.accuracy)
    if(miss > attacker.accuracy){
        if(attacker.link){
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-2.png`
        }else{
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-7.png`
            if(firstBoss){
                missInRow += 10
                player.accuracy += 10
            }
        }
        if(hailMary){
            const hailMaryEl = document.createElement("i")
            hailMaryEl.className = "fa-solid fa-book-bible miss-record"
            player.hitRecord.append(hailMaryEl)
        }else{
            const missEl = document.createElement("i")
            missEl.className = "fa-solid fa-x miss-record"
            attacker.hitRecord.append(missEl)
        }
        if(attacker.rest){
            if(attacker.rest === 3){
                attacker.rest = 1
                const minHp = Math.floor(attacker.maxHp / 4)
                const maxHp = Math.floor(attacker.maxHp / 3)
                const healAmount = Math.floor(Math.random() * (maxHp - minHp + 1)) + minHp
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount)
                updateHpEl(attacker)
                await alertScreen(`${attacker.name} has fully rested, and healed ${healAmount} health!`)
            }else{
                attacker.rest++
                await alertScreen(`${attacker.name} is resting!`)
            }
        }else{
            await alertScreen(`${attacker.name} missed!`)
        }
        enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-1.png`
        return
    }
    const crit = Math.floor(Math.random() * 100)
    console.log(`attacker: ${attacker.name}; rolled a crit of: ${crit}/100 with a crit chance of ${attacker.crit}`)
    if(crit <= attacker.crit){
        console.log(`success!`)
        const min = Math.max((attacker.attack * 2) - 2, 0)
        const max = (attacker.attack * 2) + 2
        damage = Math.floor(Math.random() * (max - min + 1)) + min
        if(target.shield){
            target.shield -= damage
            if(target.shield < 0){
                target.hp = Math.max(0, target.hp + target.shield)
                target.shield = 0
            }
        }else{
            target.hp = Math.max(0, target.hp - damage)
        }
        updateHpEl(target)
        if(attacker.link){
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-4.png`
        }else{
            if(firstBoss){
                player.accuracy -= missInRow
                missInRow = 0
            }
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-6.png`
        }
        if(hailMary){
            const hailMaryEl = document.createElement("i")
            hailMaryEl.className = "fa-solid fa-book-bible crit-record"
            player.hitRecord.append(hailMaryEl)
        }else{
            const critEl = document.createElement("i")
            critEl.className = "fa-solid fa-certificate crit-record"
            attacker.hitRecord.append(critEl)
        }
        await alertScreen(`
        ${attacker.name} hit ${target.name} with a critical strike of ${damage} damage!
        ${target.name} has ${target.hp} health remaining!
        `)
        enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-1.png`
    }else{
        const min = Math.max(attacker.attack - 2, 0)
        const max = attacker.attack + 5
        damage = Math.floor(Math.random() * (max - min + 1)) + min
        if(target.shield){
            console.log('shield is ' + target.shield)
            target.shield -= damage
            console.log('shield is now ' + target.shield)
            if(target.shield < 0){
                target.hp = Math.max(0, target.hp + target.shield)
                target.shield = 0
            }
        }else{
            target.hp = Math.max(0, target.hp - damage)
        }
        updateHpEl(target)
        if(attacker.link){
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-3.png`
        }else{
            if(firstBoss){
                player.accuracy -= missInRow
                missInRow = 0
            }
            enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-6.png`
        }
        if(hailMary){
            const hailMaryEl = document.createElement("i")
            hailMaryEl.className = "fa-solid fa-book-bible"
            player.hitRecord.append(hailMaryEl)
        }else{
            const hitEl = document.createElement("i")
            hitEl.className = "fa-solid fa-o hit-record"
            attacker.hitRecord.append(hitEl)
        }
        await alertScreen(`
        ${attacker.name} hit ${target.name} for ${damage} damage!
        ${target.name} has ${target.hp} health remaining!
        `)
        enemyPortraitEl.src = `./assets/pics/${currentEnemy.name}-1.png`
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
    if(player.accuracy === 100){
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
    shopPlayerAccuracyEl.textContent = `${player.accuracy}%`
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
    if(checkGold(5)){
        player.attack += 5
        player.gold -= 5
        updatePlayerEl()
    }
})

shopUpgradeAccuracy.addEventListener("click", (e)=>{
    e.preventDefault()
    if(checkGold(5)){
        player.accuracy += 10
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