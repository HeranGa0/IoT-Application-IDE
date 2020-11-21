/**
 Put tweets to five lists: Identity_Entitity_list, Services_list,
 Identity_Thing_list, Identity_Language_list and Relationship_list
 **/

import {tweets_arr} from "./scripts"
const Identity_Entitity_list = tweets_arr.filter(tweet => tweet['Tweet Type'] == 'Identity_Entity');
const Services_list = tweets_arr.filter(tweet => tweet['Tweet Type'] == 'Service');
const Identity_Thing_list = tweets_arr.filter(tweet => tweet['Tweet Type'] == 'Identity_Thing');
const Identity_Language_list = tweets_arr.filter(tweet => tweet['Tweet Type'] == 'Identity_Language');
const Relationship_list = tweets_arr.filter(tweet => tweet['Tweet Type'] == 'Relationship');
export {
    Identity_Entitity_list,
    Services_list,
    Identity_Thing_list,
    Identity_Language_list,
    Relationship_list
}


