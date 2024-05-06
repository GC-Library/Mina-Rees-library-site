# write a scrapetube script to get a list of all the videos from the Mina Rees youtube channel

import scrapetube
import sys

def main():
    # get the channel id
    channel_id = 'UCF11xs3zCmMdMdWoOfxP_kg'
    # get the list of videos
    videos = scrapetube.get_channel(channel_id)
    # save the list of videos to a file
    with open('data/videos.txt', 'w') as f:
        for video in videos:
            f.write(video['videoId'] + '\n')

if __name__ == '__main__':
    main()