// lib/fromas2.js
//
// Converts objects from activitystrea.ms library to as1
//
// Copyright 2018 E14N <https://e14n.com/>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

var assert = require("assert");
var _ = require("lodash");
var Step = require("step");
var as2 = require("activitystrea.ms");

// We export a single function that converts an object from
// the activitystrea.ms library to a POJO that looks like AS1

var fromAS2 = module.exports = function fromAS2(imported, callback) {

    assert(_.isObject(imported));
    assert(imported instanceof as2.models.Base, "imported is not an AS2 object: " + imported);
    assert(_.isFunction(callback));

    var copy = {};

    if (isLink(imported)) {

        Step(
            function() {
                copyLinkProperties(imported, copy, this);
            },
            function(err) {
                if (err) throw err;
                this(null, copy);
            },
            callback
        );

    } else {

        Step(
            function() {
                copyObjectProperties(imported, copy, this);
            },
            function(err) {
                if (err) throw err;
                if (isActivity(imported)) {
                    copyActivityProperties(imported, copy, this);
                } else if (isActor(imported)) {
                    copyActorProperties(imported, copy, this);
                } else if (isCollection(imported)) {
                    copyCollectionProperties(imported, copy, this);
                } else if (isPage(imported)) {
                    copyPageProperties(imported, copy, this);
                } else {
                    this(null);
                }
            },
            function(err) {
                if (err) throw err;
                copyActivityPubProperties(imported, copy, this);
            },
            function(err) {
                if (err) throw err;
                copyVcardProperties(imported, copy, this);
            },
            function(err) {
                if (err) throw err;
                copyCustomProperties(imported, copy, this);
            },
            function(err) {
                if (err) throw err;
                this(null, copy);
            },
            callback
        );
    }

    return undefined;
};

function copyObjectProperties(imported, copy, callback) {

    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));

    if (imported.type) {
        if (isActivity(imported)) {
            copy.verb = convertType(getType(imported));
        } else if (!isCollection(imported) && !isPage(imported)) {
            copy.objectType = convertType(getType(imported));
        }
    }

    if (!isCollection(imported) && !isPage(imported)) {
        copy.id = imported.id;
        addLink(copy, "self", copy.id);
    }

    if (imported.name) {
        copy.displayName = imported.name.get();
    }

    if (imported.summary) {
        copy.summary = imported.summary.get();
    }

    if (imported.published) {
        copy.published = isoDate(imported.published);
    }

    if (imported.updated) {
        copy.updated = isoDate(imported.updated);
    }

    if (imported.content) {
        copy.content = imported.content.get();

        // mediaType is only meaningful as an indicator of the content
        // media type, so only if content is defined. activitystrea.ms library
        // returns 'text/html' by default

        if (imported.mediaType) {
            copy.dc = copy.dc || {};
            copy.dc.format = imported.mediaType;
        }
    }

    if (imported.endTime) {
        copy.endTime = isoDate(imported.endTime);
    }

    if (imported.startTime) {
        copy.startTime = isoDate(imported.startTime);
    }

    if (imported.duration) {
        copy.duration = imported.duration.get();
    }

    // Take the first of image or icon
    for (var iprop of ["image", "icon"]) {
        var member = imported.get(iprop);
        if (member && member.length >= 1 ) {
            var first = member.first;
            var link = null;
            if (isLink(first)) {
                link = first;
            } else if (first.url && first.url.length >= 1 && isLink(first.url.first)) {
                link = first.url.first;
            }
            if (link) {
                var image = copy.image = copy.image || {};
                if (link.href) {
                    image.url = link.href;
                }
                if (link.width) {
                    image.width = link.width;
                }
                if (link.height) {
                    image.height = link.height;
                }
            }
        }
    }

    // XXX: attachment
    // XXX: attributedTo
    // XXX: audience
    // XXX: context
    // XXX: generator
    // XXX: inReplyTo
    // XXX: location
    // XXX: preview
    // XXX: replies
    // XXX: tag
    // XXX: url
    // XXX: to
    // XXX: bto
    // XXX: cc
    // XXX: bcc

    setImmediate(callback, null);
}

function addLink(obj, rel, href) {
    obj.links = obj.links || {};
    obj.links[rel] = {
        href: href
    };
}

var NS = "https://www.w3.org/ns/activitystreams#";

function getType(imported) {
    var full = String(imported.type);
    if (full.startsWith(NS)) {
        return full.substr(NS.length);
    } else {
        return full;
    }
}

function convertType(str) {
    assert(_.isString(str));
    if (str.startsWith(NS)) {
        return str.substr(NS.length).toLowerCase();
    } else {
        return str.toLowerCase();
    }
}

function isActivity(obj) {
    return false;
}

function isActor(obj) {
    return false;
}

function isLink(obj) {
    return getType(obj) === "Link";
}

function isCollection(obj) {
    var type = getType(obj);
    return (type === "Collection" || type === "OrderedCollection");
}

function isPage(obj) {
    var type = getType(obj);
    return (type === "CollectionPage" || type === "OrderedCollectionPage");
}

function copyActivityProperties(imported, copy, callback) {
    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));
    assert(isActivity(imported));
    var resolve = function resolve() {
        callback(null);
    };
    var reject = function reject(err) {
        assert(err instanceof Error, "err is not an Error");
        callback(err);
    };
    // XXX: actor
    // XXX: object
    // XXX: target
    // XXX: origin
    // XXX: result
    // XXX: instrument
    resolve();
}

function copyActorProperties(imported, copy, callback) {
    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));
    assert(isActor(imported));
    var resolve = function resolve() {
        callback(null);
    };
    var reject = function reject(err) {
        assert(_.isInstanceOf(err, "Error"));
        callback(err);
    };
    // XXX: any actor properties?
    resolve();
}

function copyLinkProperties(imported, copy, callback) {
    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));
    assert(isLink(imported));
    // XXX: href
    // XXX: id
    // XXX: name
    // XXX: hreflang
    // XXX: mediaType
    // XXX: rel
    // XXX: height
    // XXX: width
    callback(null);
}

function copyActivityPubProperties(imported, copy, callback) {

    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));

    // XXX: source

    if (imported.inbox) {
        copy.links = copy.links || {};
        copy.links["activity-inbox"] = {href: imported.inbox.first.id};
    }

    if (imported.outbox) {
        copy.links = copy.links || {};
        copy.links["activity-outbox"] = {href: imported.outbox.first.id};
    }

    if (imported.preferredUsername) {
        copy.preferredUsername = imported.preferredUsername;
    }

    // XXX: streams
    // XXX: endpoints
    // XXX: proxyUrl
    // XXX: oauthAuthorizationEndpoint
    // XXX: oauthTokenEndpoint
    // XXX: provideClientKey
    // XXX: signClientKey
    // XXX: sharedInbox

    // XXX: following
    // XXX: followers
    // XXX: liked
    // XXX: shares
    // XXX: likes

    var collections = ["following", "followers", "liked", "shares", "likes"];

    Step(
        function() {
            var group = this.group();
            _.each(collections, function(coll) {
                if (imported.has(coll) && imported[coll].length > 0) {
                    fromAS2(imported[coll].first, group());
                } else {
                    group()();
                }
            });
        },
        function(err, copies) {
            if (err) throw err;
            _.each(copies, function(collcopy, i) {
                if (collcopy) {
                    if (collections[i] === "liked") {
                        copy.favorites = toCollectionProperty(collcopy);
                    } else {
                        copy[collections[i]] = toCollectionProperty(collcopy);
                    }
                }
            });
            this();
        },
        callback
    );

}

function copyCollectionProperties(imported, copy, callback) {
    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));
    assert(isCollection(imported));
    var resolve = function resolve() {
        callback(null);
    };
    var reject = function reject(err) {
        assert(_.isInstanceOf(err, "Error"));
        callback(err);
    };
    // XXX: items
    // XXX: orderedItems
    // XXX: totalItems
    // XXX: first
    // XXX: last
    // XXX: current
    resolve();
}

function copyPageProperties(imported, copy, callback) {
    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));
    assert(isPage(imported));
    var resolve = function resolve() {
        callback(null);
    };
    var reject = function reject(err) {
        assert(_.isInstanceOf(err, "Error"));
        callback(err);
    };
    // XXX: collection properties
    // XXX: partOf
    // XXX: next
    // XXX: prev
    resolve();
}

var customCopiers = {

};

function copyCustomProperties(imported, copy, callback) {
    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));
    var type = getType(imported);
    if (_.has(customCopiers, type)) {
        customCopiers[type](imported, copy, callback);
    } else {
        callback(null);
    }
}

var VCARD_NS = "http://www.w3.org/2006/vcard/ns#";

function copyVcardProperties(imported, copy, callback) {

    assert(_.isObject(imported));
    assert(_.isObject(copy));
    assert(_.isFunction(callback));
    assert(_.isFunction(imported[Symbol.iterator]));

    var it = imported[Symbol.iterator]();

    for (var prop = it.next(); !prop.done; prop = it.next()) {
        var key = prop.value;
        if (key.startsWith(VCARD_NS)) {
            var short = key.substr(VCARD_NS.length);
            var value = imported.get(key);
            copy.vcard = copy.vcard || {};
            copy.vcard[short] = value.first;
        }
    }

    callback(null);
}

function isoDate(property) {
    assert(property);
    var value = property.get();
    assert(value);
    return value.toDate().toISOString();
}

// Turn a collection object into a property

function toCollectionProperty(obj) {
    var res = {};
    if (_.has(obj, "links.self.href")) {
        res.url = _.get(obj, "links.self.href");
    } else if (_.has(obj, "url")) {
        res.url = obj.url;
    }
    if (_.has(obj, "links")) {
        var others = _.omit(obj.links, "self");
        if (_.keys(others).length > 0) {
            res.links = others;
        }
    }
    // Copy everything else
    _.assign(res, _.omit(obj, ["links", "url", "id", "objectType"]));
    return res;
}