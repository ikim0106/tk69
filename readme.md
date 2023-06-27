# pinkbean Discord bot

Discord bot source

invite: https://shorturl.at/gxGZ8


# Commands
Documentation for how to use bot commands. Default prefix is =

## Music


|Command         |Parameters                        |Description                       |Examples                |
|----------------|-------------------------------|-------------------------------------|--------|
|play       |`YouTube video / YouTube playlist / YouTube search query`    |Plays specified song/playlist/query            |=play [https://www.youtube.com/watch?v=y1L0B5c3Ed8](https://www.youtube.com/watch?v=y1L0B5c3Ed8 "https://www.youtube.com/watch?v=y1L0B5c3Ed8") <br>=play https://www.youtube.com/playlist?list=PLq4Ri5DcQp8roDZ5DvEun18UXjxue_HnD<br>=play 작별인사 Ash Island|
|die        |none                   | Deletes the current queue and exits voice channel    | =die |
|pause      |none                   | Pauses the current playing song | =pause |
|resume     |none | Resumes the current paused song| =resume |
|skip       |none |Skips the current song| =skip |
|nowplaying |none |Shows the currently playing song| =nowplaying |
|playskip   |`YouTube video / YouTube playlist / YouTube search query`|Skips the current song and starts playing the specified song/playlist/query| =playskip 작별인사 Ash Island |
|shuffle    |none|Shuffles the songs in queue| =shuffle |
|queue      |none|Shows the current queue| =queue |
|move       |`Two indices of songs to swap (1-based indexing)`|Swaps the order of the specified two songs in queue| =move 1 3 |
|seek       |`Specify at least one of [hour, minute, and second] of desired time in the song to seek to`|Seeks to the specified time of the current playing song| =seek 1h2m3s <br> =seek 1m20s|
|remove     |`Index of song to delete from queue (1-based indexing)`|Removes the specified song from queue| =remove 5 |

TODOs: 
- add parameter parsing to "skip" command to specify how many songs to skip
- slash commands<
- button commands
- Spotify support