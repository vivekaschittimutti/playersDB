const express = require('express')
const app = express()
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

let dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null
const intializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
intializeDbServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//get players API
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const player = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};`

  const playerdetails = await db.get(player)
  response.send({
    playerId: playerdetails.player_id,
    playerName: playerdetails.player_name,
    jerseyNumber: playerdetails.jersey_number,
    role: playerdetails.role,
  })
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayer = `
  INSERT INTO cricket_team(player_name,jersey_number,role) VALUES('${playerName}','${jerseyNumber}','${role}');`
  await db.run(addPlayer)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updateplayerDetails = `
    UPDATE
      cricket_team
    SET
      player_id = '${playerId}',
      player_name = '${playerName}',
      jersey_number = '${jerseyNumber}',
      role = '${role}'
    WHERE
      player_id = ${playerId};`
  await db.run(updateplayerDetails)
  response.send('Player Details Updated')
})

//delete player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `
  DELETE FROM cricket_team WHERE player_id = ${playerId};`
  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
