import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Sound = {
    id : Nat;
    name : Text;
    description : Text;
    tags : [Text];
    audioBlob : Storage.ExternalBlob;
    playCount : Nat;
  };

  module Sound {
    public func compare(sound1 : Sound, sound2 : Sound) : Order.Order {
      switch (Nat.compare(sound1.playCount, sound2.playCount)) {
        case (#equal) { Text.compare(sound1.name, sound2.name) };
        case (order) { order };
      };
    };
  };

  let sounds = Map.empty<Nat, Sound>();
  var nextSoundId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  func seedSampleSounds() {
    if (sounds.isEmpty()) {
      let sampleSounds = List.fromArray<Sound>([
        {
          id = 0;
          name = "Bruh";
          description = "Classic 'bruh' sound effect";
          tags = ["meme", "bruh", "classic"];
          audioBlob = "https://example.com/bruh.mp3";
          playCount = 0;
        },
        {
          id = 1;
          name = "Sad Violin";
          description = "Meme sad violin sound";
          tags = ["sad", "violin", "meme"];
          audioBlob = "https://example.com/sad_violin.mp3";
          playCount = 0;
        },
        {
          id = 2;
          name = "To Be Continued";
          description = "To be continued meme sound";
          tags = ["to be continued", "meme"];
          audioBlob = "https://example.com/to_be_continued.mp3";
          playCount = 0;
        },
        {
          id = 3;
          name = "Airhorn";
          description = "Meme airhorn sound";
          tags = ["airhorn", "meme"];
          audioBlob = "https://example.com/airhorn.mp3";
          playCount = 0;
        },
        {
          id = 4;
          name = "Deez Nuts";
          description = "Deez nuts meme sound";
          tags = ["deez nuts", "meme"];
          audioBlob = "https://example.com/deez_nuts.mp3";
          playCount = 0;
        },
        {
          id = 5;
          name = "YEEEAAAHHH";
          description = "YEEEAAAHHH meme sound";
          tags = ["meme", "yeah"];
          audioBlob = "https://example.com/yeah.mp3";
          playCount = 0;
        },
        {
          id = 6;
          name = "Triggered";
          description = "Triggered meme sound";
          tags = ["triggered", "meme"];
          audioBlob = "https://example.com/triggered.mp3";
          playCount = 0;
        },
        {
          id = 7;
          name = "John Cena";
          description = "John Cena meme sound";
          tags = ["john cena", "meme"];
          audioBlob = "https://example.com/john_cena.mp3";
          playCount = 0;
        },
      ]);
      sampleSounds.forEach(func(sound) { sounds.add(sound.id, sound) });
      nextSoundId := 8;
    };
  };

  seedSampleSounds();

  public shared ({ caller }) func addSound(
    name : Text,
    description : Text,
    tags : [Text],
    audioBlob : Storage.ExternalBlob,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add sounds");
    };

    let sound : Sound = {
      id = nextSoundId;
      name;
      description;
      tags;
      audioBlob;
      playCount = 0;
    };

    sounds.add(nextSoundId, sound);
    nextSoundId += 1;
    sound.id;
  };

  public query ({ caller }) func getSound(id : Nat) : async Sound {
    switch (sounds.get(id)) {
      case (null) { Runtime.trap("Sound not found") };
      case (?sound) { sound };
    };
  };

  public query ({ caller }) func getAllSounds() : async [Sound] {
    sounds.values().toArray();
  };

  public shared ({ caller }) func updateSound(
    id : Nat,
    name : Text,
    description : Text,
    tags : [Text],
    audioBlob : Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update sounds");
    };

    switch (sounds.get(id)) {
      case (null) { Runtime.trap("Sound not found") };
      case (?sound) {
        let updatedSound : Sound = {
          id;
          name;
          description;
          tags;
          audioBlob;
          playCount = sound.playCount;
        };
        sounds.add(id, updatedSound);
      };
    };
  };

  public shared ({ caller }) func deleteSound(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete sounds");
    };

    if (not sounds.containsKey(id)) {
      Runtime.trap("Sound not found");
    };
    sounds.remove(id);
  };

  public shared ({ caller }) func incrementPlayCount(id : Nat) : async () {
    switch (sounds.get(id)) {
      case (null) { Runtime.trap("Sound not found") };
      case (?sound) {
        let updatedSound : Sound = {
          id = sound.id;
          name = sound.name;
          description = sound.description;
          tags = sound.tags;
          audioBlob = sound.audioBlob;
          playCount = sound.playCount + 1;
        };
        sounds.add(id, updatedSound);
      };
    };
  };

  public shared ({ caller }) func updateAudioBlob(id : Nat, newAudioBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update audio blobs");
    };

    switch (sounds.get(id)) {
      case (null) { Runtime.trap("Sound not found") };
      case (?sound) {
        let updatedSound : Sound = {
          id = sound.id;
          name = sound.name;
          description = sound.description;
          tags = sound.tags;
          audioBlob = newAudioBlob;
          playCount = sound.playCount;
        };
        sounds.add(id, updatedSound);
      };
    };
  };

  public query ({ caller }) func searchSoundsByTag(tag : Text) : async [Sound] {
    let results = List.empty<Sound>();

    for (sound in sounds.values()) {
      for (soundTag in sound.tags.values()) {
        if (Text.equal(soundTag, tag)) {
          results.add(sound);
        };
      };
    };

    results.toArray();
  };

  public query ({ caller }) func searchSoundsByTags(tags : [Text]) : async [Sound] {
    let results = List.empty<Sound>();

    for (sound in sounds.values()) {
      for (searchTag in tags.values()) {
        for (soundTag in sound.tags.values()) {
          if (Text.equal(soundTag, searchTag)) {
            results.add(sound);
          };
        };
      };
    };

    results.toArray();
  };

  public query ({ caller }) func getMostPlayedSounds(limit : Nat) : async [Sound] {
    let sortedSounds = sounds.values().toArray().sort();
    sortedSounds.sliceToArray(0, Nat.min(limit, sortedSounds.size()));
  };
};
