/**
 Services tab contains a filter to show services of all or a subset of the things
 (that is shows the union of services belonging to 4, 3, 2 or 1 things).
 Each service presented under this tab should contain an identity of its owner thing.
 **/

import {Services_list} from "../js/parseTweets"



/**
 * filter services that belong to certain things
 * @param   {list} a list of things id
 * @returns {list} a list of services that will be displayed under service tab
 */
const getFilteredServices = (things_id_to_display) => {
    return Services_list.filter(service => things_id_to_display[service["Thing ID"]] > -1);
};