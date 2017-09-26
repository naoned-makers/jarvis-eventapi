import { Service } from "threerest";
import { Methods } from "threerest";
import { Hal } from "threerest";
import { Pagination } from "threerest";

import ArrayHelper from "../helpers/arrayHelper";

var dbSessions = Object.values(require('../../../database/sessions'));
var dbSpeakers = Object.values(require('../../../database/speakers'));
var dbSchedules = Object.values(require('../../../database/schedule'));


let result = [];

@Service.path("/talks")
export default class ServiceTalks {

  @Methods.get("/")
  @Hal.halServiceMethod(true)
  getAll(value, request) {
    if (result.length === 0) {
      this.createData();
    }
    
    if (request.query.society) {
        return this.searchWithCriteria('company', request.query.society);
    } else if (request.query.tag) {
        return this.searchWithCriteria('tag', request.query.tag);
    }
    
    return result;
  }

  @Methods.get("/:id")
  @Hal.halServiceMethod()
  getswitchId(value) {
    let idSession = value.id; 
    if (result.length === 0) {
      this.createData();
    } 
    if (value.id) {
      return result.find(function (element) {
        return element.id == parseInt(value.id);
      });
    } 
    return result; 
  }

  createData() {
    for (var i = 0; i < dbSessions.length; i++) {
      let session = dbSessions[i];
      if (session['speakers']) {
        session['speakers'] = ArrayHelper.getSpeakers(session['speakers']);
        result.push(session);
      }
      session['slot'] = ArrayHelper.getSlot(session.id);
    }
  }

  searchWithCriteria(criteria, valueCriteria) {
    let resultWithCriteria =[];
    result.map(function(session) {
      let found = false;
      if (criteria === 'company') {
        found = session.speakers.some(function(speaker) {
          return speaker.company === valueCriteria;
        });
      } else if (criteria === 'tag') {
        found = session.tags.some(function(tag) {
          return tag === valueCriteria;
        });
      }
      
      if(found) {
        resultWithCriteria.push(session);
      }
    });
    return resultWithCriteria;
  }
}
