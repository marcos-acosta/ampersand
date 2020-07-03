const ONESQ = 5;
const LEFT = [0, -1];
const RIGHT = [0, 1];
const UP = [-1, 0];
const DOWN = [1, 0];
const BOMB_ZOME = [[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]];
var am_pos = [4, 4]
var enemies = []
var bomb_list = []
var ex_count = 0;
var en_count = 0;
var b_count = 0;
var enemy_threshold = .55;
var bomb_threshold = .95;
var score = 0;
var bombs = 3;
var kills = 0;
var high = 0;
var bombs_used = 0;
var time_out = false;
var game_over = false;
var valid_move = false;

$(document).ready(function() {
    $("#info").click(function() {
        if (!game_over) {
            time_out = true;
            $("#infoPanel").slideDown(70);
            $(".grayOut").fadeIn(70);
        }
    });
});

$(document).keypress(function(event) {
    valid_move = false;
    if (!time_out) {
        char = String.fromCharCode(event.which);
        if (char == 'w') {
            moveAmpersand('up');
            valid_move = true;
        } else if (char == 'a') {
            moveAmpersand('left');
            valid_move = true;
        } else if (char == 's') {
            moveAmpersand('down');
            valid_move = true;
        } else if (char == 'd') {
            moveAmpersand('right');
            valid_move = true;
        } else if (event.which == 32) {
            if (bombs > 0) {
                valid_move = true;
                useBomb();
                bombs--;
                bombs_used++;
            } else {
                shake();
            }
        }
        if (valid_move) {
            score++;
            if ('wasd'.includes(char)) {
                if (bombPresent(am_pos)) {
                    collectBombAt(am_pos);
                }
            }
            updateStats();
            moveEnemies();
            if (Math.random() > enemy_threshold) {
                newEnemy();
            }
            if (Math.random() > bomb_threshold) {
                newBomb();
            }
        }
    } else {
        if (game_over) {
            $("#youLost").slideUp(70);
            $(".grayOut").fadeOut(70);
            reset();
            game_over = false;
        } else {
            $("#infoPanel").slideUp(70);
            $(".grayOut").fadeOut(70);
        }
        time_out = false;
    }
});

function reset() {
    if (score > high) {
        high = score;
    }
    bombs_used = 0;
    score = 0;
    kills = 0;
    bombs = 3;
    updateStats();
    enemies = [];
    bomb_list = [];
    $(".enemy").remove();
    $(".bomb").remove();
    am_pos = [4, 4]
    $(".ampersand").css('left', '21vw');
    $(".ampersand").css('top', '21vw');
}

function moveAmpersand(direction) {
    if (direction == 'left') {
        if (am_pos[1] == 0) {
            nudge(direction);
        } else if (enemyPresent(c_add(am_pos, LEFT))) {
            nudge(direction);
            attack(LEFT);
        } else {
            $(".ampersand").animate({left: ((am_pos[1]-1)*ONESQ + .75) + 'vw'}, 60);
            $(".ampersand").animate({left: ((am_pos[1]-1)*ONESQ + 1) + 'vw'}, 10);
            am_pos[1]--;
        }
    } else if (direction == 'right') {
        if (am_pos[1] == 8) {
            nudge(direction)
        } else if (enemyPresent(c_add(am_pos, RIGHT))) {
            nudge(direction);
            attack(RIGHT);
        } else {
            $(".ampersand").animate({left: ((am_pos[1]+1)*ONESQ + 1.25) + 'vw'}, 60);
            $(".ampersand").animate({left: ((am_pos[1]+1)*ONESQ + 1) + 'vw'}, 10);
            am_pos[1]++;
        }
    } else if (direction == 'up') {
        if (am_pos[0] == 0) {
            nudge(direction)
        } else if (enemyPresent(c_add(am_pos, UP))) {
            nudge(direction);
            attack(UP);
        } else {
            $(".ampersand").animate({top: ((am_pos[0]-1)*ONESQ + 0.75) + 'vw'}, 60);
            $(".ampersand").animate({top: ((am_pos[0]-1)*ONESQ + 1) + 'vw'}, 10);
            am_pos[0]--;
        }
    } else {
        if (am_pos[0] == 8) {
            nudge(direction)
        } else if (enemyPresent(c_add(am_pos, DOWN))) {
            nudge(direction);
            attack(DOWN);
        } else {
            $(".ampersand").animate({top: ((am_pos[0]+1)*ONESQ + 1.25) + 'vw'}, 60);
            $(".ampersand").animate({top: ((am_pos[0]+1)*ONESQ + 1) + 'vw'}, 10);
            am_pos[0]++;
        }
    }
}

function nudge(direction) {
    if (direction == 'left') {
        $(".ampersand").animate({left: (am_pos[1]*ONESQ + 0.5) + 'vw'}, 35);
        $(".ampersand").animate({left: (am_pos[1]*ONESQ + 1) + 'vw'}, 35);
    } else if (direction == 'right') {
        $(".ampersand").animate({left: (am_pos[1]*ONESQ + 1.5) + 'vw'}, 35);
        $(".ampersand").animate({left: (am_pos[1]*ONESQ + 1) + 'vw'}, 35);
    } else if (direction == 'up') {
        $(".ampersand").animate({top: (am_pos[0]*ONESQ + 0.5) + 'vw'}, 35);
        $(".ampersand").animate({top: (am_pos[0]*ONESQ + 1) + 'vw'}, 35);
    } else {
        $(".ampersand").animate({top: (am_pos[0]*ONESQ + 1.5) + 'vw'}, 35);
        $(".ampersand").animate({top: (am_pos[0]*ONESQ + 1) + 'vw'}, 35);
    }
}

function shake() {
    $(".ampersand").animate({left: (am_pos[1]*ONESQ + 0.75) + 'vw'}, 24);
    $(".ampersand").animate({left: (am_pos[1]*ONESQ + 1.25) + 'vw'}, 24);
    $(".ampersand").animate({left: (am_pos[1]*ONESQ + 1) + 'vw'}, 24);
}

function attack(direction) {
    let attack_pos = c_add(am_pos, direction);
    removeEnemy(attack_pos);
    score += 10;
    kills++;
    updateStats();
}

function removeEnemy(coordinate) {
    let index = -1;
    let deleted;
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (c_equal(enemy.position, coordinate)) {
            deleted = enemy;
            index = i;
            break;
        }
    }
    enemies.splice(index, 1);
    $("#en" + deleted.id).fadeOut(100, function() {      
        $("#en" + deleted.id).remove();
    });
}

function newEnemy() {
    let edge, square, coordinate;
    let circuitbreaker = 0;
    do {
        circuitbreaker++;
        if (circuitbreaker >= 200) {
            return;
        }
        edge = Math.floor(Math.random() * 4)
        square = Math.floor(Math.random() * 8)
        coordinate;
        if (edge == 0) {
            coordinate = [square, 8]
        } else if (edge == 1) {
            coordinate = [0, square]
        } else if (edge == 2) {
            coordinate = [square + 1, 0]
        } else {
            coordinate = [8, square + 1]
        }
    } while (distance(coordinate, am_pos) < 2 || squareOccupied(coordinate) || bombPresent(coordinate));
    enemy = addEnemy(coordinate, edge);
    animateEnemyEntrance(enemy, edge);
}

function addEnemy(coordinate) {
    let enemy = {
        id: en_count,
        position: coordinate
    }
    enemies.push(enemy);
    en_count++;
    return enemy;
}

function squareOccupied(coordinate) {
    if (c_equal(coordinate, am_pos)) {
        return true;
    }
    if (enemyPresent(coordinate)) {
        return true;
    }
    return false;
}

function enemyPresent(coordinate) {
    for (let i = 0; i < enemies.length; i++) {
        if (c_equal(enemies[i].position, coordinate)) {
            return true;
        }
    }
    return false;
}

function bombPresent(coordinate) {
    for (let i = 0; i < bomb_list.length; i++) {
        if (c_equal(bomb_list[i].position, coordinate)) {
            return true;
        }
    }
    return false;
}

function c_equal(c1, c2) {
    if (c1[0] == c2[0] && c1[1] == c2[1]) {
        return true;
    }
    return false;
}

function animateEnemyEntrance(enemy, edge) {
    let top_left = [0, 0]
    if (edge == 0) {
        top_left = [enemy.position[0]*ONESQ + 1, '46'];
    } else if (edge == 1) {
        top_left = ['-4', enemy.position[1]*ONESQ + 1];
    } else if (edge == 2) {
        top_left = [enemy.position[0]*ONESQ + 1, '-4'];
    } else {
        top_left = ['46', enemy.position[1]*ONESQ + 1];
    }
    $(".board").append('<div class="enemy" id="en' + enemy.id + '" style="z-index: 5; top: ' + top_left[0] + 'vw; left:' + top_left[1] + 'vw; opacity: 0;">#</div>');
    $("#en" + enemy.id).animate({opacity: 1, left: (enemy.position[1]*ONESQ + 1) + 'vw', top: (enemy.position[0]*ONESQ + 1) + 'vw'}, 70);
}

function distance(c1, c2) {
    return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
}

function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let potential;
        directions = getPotentialMoves(enemy.position);
        for (let j = 0; j < directions.length; j++) {
            potential = c_add(enemy.position, directions[j]);
            if (!enemyPresent(potential) && validSquare(potential)) {
                enemy.position = potential;
                animateEnemyMove(enemy, directions[j]);
                if (c_equal(potential, am_pos)) {
                    end_game();
                }
                break;
            }
        }
    }
}

function end_game() {
    time_out = true;
    game_over = true;
    $("#panelScore").html(score);
    $("#panelKills").html(kills);
    $("#panelBombsUsed").html(bombs_used);
    $("#youLost").slideDown(70);
    $(".grayOut").fadeIn(70);
}

function c_add(c1, c2) {
    return [c1[0] + c2[0], c1[1] + c2[1]];
}

function animateEnemyMove(enemy, direction) {
    let id = enemy.id;
    let position = enemy.position;
    if (direction[0] == 1) {
        $("#en" + id).animate({left: ((position[1])*ONESQ + 1 + 'vw'), top: ((position[0])*ONESQ + 1.25 + 'vw')}, 60);
    } if (direction[0] == -1) {
        $("#en" + id).animate({left: ((position[1])*ONESQ + 1 + 'vw'), top: ((position[0])*ONESQ + 0.75 + 'vw')}, 60);
    } if (direction[1] == 1) {
        $("#en" + id).animate({left: ((position[1])*ONESQ + 1.25 + 'vw'), top: ((position[0])*ONESQ + 1 + 'vw')}, 60);
    } if (direction[1] == -1) {
        $("#en" + id).animate({left: ((position[1])*ONESQ + 0.75 + 'vw'), top: ((position[0])*ONESQ + 1 + 'vw')}, 60);
    }
    $("#en" + id).animate({left: ((position[1])*ONESQ + 1 + 'vw'), top: ((position[0])*ONESQ + 1 + 'vw')}, 10);
}

function validSquare(coordinate) {
    for (let i = 0; i < 2; i++) {
        if (coordinate[i] < 0 || coordinate[i] > 8) {
            return false;
        }
    }
    return true;
}

function getPotentialMoves(e_pos) {
    // Same row
    if (e_pos[0] == am_pos[0]) {
        // Enemy is to your right, move left
        if (e_pos[1] > am_pos[1]) {
            if (Math.random() > .5) {
                return [[0, -1], [1, 0], [-1, 0]];
            } else {
                return [[0, -1], [-1, 0], [1, 0]];
            }
        }
        // Enemy is to your left, move right
        else {
            if (Math.random() > .5) {
                return [[0, 1], [1, 0], [-1, 0]];
            } else {
                return [[0, 1], [-1, 0], [1, 0]];
            }
        }
    }
    // Same column
    else if (e_pos[1] == am_pos[1]) {
        // Enemy is below you, move up
        if (e_pos[0] > am_pos[0]) {
            if (Math.random() > .5) {
                return [[-1, 0], [0, -1], [0, 1]];
            } else {
                return [[-1, 0], [0, 1], [0, -1]];
            }
        }
        // Enemy is above you, move down
        else {
            if (Math.random() > .5) {
                return [[1, 0], [0, -1], [0, 1]];
            } else {
                return [[1, 0], [0, 1], [0, -1]];
            }
        }
    } else {
        let x_delta = am_pos[1] - e_pos[1];
        let y_delta = e_pos[0] - am_pos[0];
        let angle = Math.atan((y_delta / x_delta)) * (180 / Math.PI);
        if (x_delta < 0) {
            angle *= -1;
        }
        if (angle > 45) {
            if (x_delta > 0) {
                return [[-1, 0], [0, 1]];
            } else {
                return [[-1, 0], [0, -1]];
            }
        } else if (angle < -45) {
            if (x_delta > 0) {
                return [[1, 0], [0, 1]];
            } else {
                return [[1, 0], [0, -1]];
            }
        } else if (angle < 45 && x_delta > 0) {
            if (angle > 0) {
                return [[0, 1], [-1, 0]];
            } else {
                return [[0, 1], [1, 0]];
            }
        } else if (angle < 45 && x_delta < 0) {
            if (angle > 0) {
                return [[0, -1], [-1, 0]];
            } else {
                return [[0, -1], [1, 0]];
            }
        } else if (angle == 45) {
            if (x_delta > 0) {
                if (Math.random() > .5) {
                    return [[-1, 0], [0, 1]];
                } else {
                    return [[0, 1], [-1, 0]];
                }
            } else {
                if (Math.random() > .5) {
                    return [[-1, 0], [0, -1]];
                } else {
                    return [[0, -1], [-1, 0]];
                }
            }
            return [0, 0];
        } else {
            if (x_delta > 0) {
                if (Math.random() > .5) {
                    return [[1, 0], [0, 1]];
                } else {
                    return [[0, 1], [1, 0]];
                }
            } else {
                if (Math.random() > .5) {
                    return [[1, 0], [0, -1]];
                } else {
                    return [[0, -1], [1, 0]];
                }
            }
        }
    }
}

function updateStats() {
    $("#sideScore").html(score);
    $("#sideBombs").html(bombs);
    $("#sideKills").html(kills);
    $("#sideHigh").html(high);
}

function useBomb() {
    for (let i = 0; i < BOMB_ZOME.length; i++) {
        let potential = c_add(am_pos, BOMB_ZOME[i]);
        if (validSquare(potential) && enemyPresent(potential)) {
            removeEnemy(potential);
            score += 5;
            kills++;
        }
    }
}

function newBomb() {
    let coord;
    let circuitbreaker = 0;
    do {
        circuitbreaker++;
        if (circuitbreaker > 200) {
            return;
        }
        coord = [Math.floor(Math.random()*9), Math.floor(Math.random()*9)];
    } while (squareOccupied(coord));
    bomb = addBomb(coord);
    top_left = [bomb.position[0]*ONESQ + 1, bomb.position[1]*ONESQ + 1]
    $(".board").append('<div class="bomb" id="b' + bomb.id + '" style="top: ' + top_left[0] + 'vw; left:' + top_left[1] + 'vw; display: none;">@</div>');
    $("#b" + bomb.id).fadeIn(70);
}

function addBomb(coordinate) {
    let bomb = {
        id: b_count,
        position: coordinate
    }
    bomb_list.push(bomb);
    b_count++;
    return bomb;
}

function collectBombAt(coordinate) {
    let index = -1;
    let deleted;
    for (let i = 0; i < bomb_list.length; i++) {
        let bomb = bomb_list[i];
        if (c_equal(bomb.position, coordinate)) {
            deleted = bomb;
            index = i;
            break;
        }
    }
    bomb_list.splice(index, 1);
    $("#b" + deleted.id).fadeOut(100, function() {      
        $("#b" + deleted.id).remove();
    });
    bombs++;
}