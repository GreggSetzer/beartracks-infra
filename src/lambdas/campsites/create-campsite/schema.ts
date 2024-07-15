import Joi from 'joi';

export const schema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  url: Joi.string().uri().optional().allow(''),
  name: Joi.string().optional().allow(''),
  parkCode: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  latitude: Joi.string().optional().allow(''),
  longitude: Joi.string().optional().allow(''),
  reservationInfo: Joi.string().optional().allow(''),
  reservationUrl: Joi.string().uri().optional().allow(''),
  regulationsUrl: Joi.string().uri().optional().allow(''),
  regulationsOverview: Joi.string().optional().allow(''),
  amenities: Joi.object({
    trashRecyclingCollection: Joi.string().optional().allow(''),
    toilets: Joi.array().items(Joi.string()).optional(),
    internetConnectivity: Joi.string().optional().allow(''),
    showers: Joi.array().items(Joi.string()).optional(),
    cellPhoneReception: Joi.string().optional().allow(''),
    laundry: Joi.string().optional().allow(''),
    amphitheater: Joi.string().optional().allow(''),
    dumpStation: Joi.string().optional().allow(''),
    campStore: Joi.string().optional().allow(''),
    staffOrVolunteerHostOnsite: Joi.string().optional().allow(''),
    potableWater: Joi.array().items(Joi.string()).optional(),
    iceAvailableForSale: Joi.string().optional().allow(''),
    firewoodForSale: Joi.string().optional().allow(''),
    foodStorageLockers: Joi.string().optional().allow(''),
  }).optional(),
  contacts: Joi.object({
    phoneNumbers: Joi.array().items(
      Joi.object({
        phoneNumber: Joi.string().optional().allow(''),
        description: Joi.string().optional().allow(''),
        extension: Joi.string().optional().allow(''),
        type: Joi.string().optional().allow(''),
      }),
    ).optional(),
    emailAddresses: Joi.array().items(
      Joi.object({
        description: Joi.string().optional().allow(''),
        emailAddress: Joi.string().optional().allow(''),
      }),
    ).optional(),
  }).optional(),
  fees: Joi.array().items(
    Joi.object({
      cost: Joi.string().optional().allow(''),
      description: Joi.string().optional().allow(''),
      title: Joi.string().optional().allow(''),
    }),
  ).optional(),
  directionsOverview: Joi.string().optional().allow(''),
  directionsUrl: Joi.string().uri().optional().allow(''),
  operatingHours: Joi.array().items(
    Joi.object({
      exceptions: Joi.array().items(
        Joi.object({
          exceptionHours: Joi.object({
            wednesday: Joi.string().optional().allow(''),
            monday: Joi.string().optional().allow(''),
            thursday: Joi.string().optional().allow(''),
            sunday: Joi.string().optional().allow(''),
            tuesday: Joi.string().optional().allow(''),
            friday: Joi.string().optional().allow(''),
            saturday: Joi.string().optional().allow(''),
          }).optional(),
          startDate: Joi.string().optional().allow(''),
          name: Joi.string().optional().allow(''),
          endDate: Joi.string().optional().allow(''),
        }),
      ).optional(),
      description: Joi.string().optional().allow(''),
      standardHours: Joi.object({
        wednesday: Joi.string().optional().allow(''),
        monday: Joi.string().optional().allow(''),
        thursday: Joi.string().optional().allow(''),
        sunday: Joi.string().optional().allow(''),
        tuesday: Joi.string().optional().allow(''),
        friday: Joi.string().optional().allow(''),
        saturday: Joi.string().optional().allow(''),
      }).optional(),
      name: Joi.string().optional().allow(''),
    }),
  ).optional(),
  addresses: Joi.array().items(
    Joi.object({
      postalCode: Joi.string().optional().allow(''),
      city: Joi.string().optional().allow(''),
      stateCode: Joi.string().optional().allow(''),
      countryCode: Joi.string().optional().allow(''),
      provinceTerritoryCode: Joi.string().optional().allow(''),
      line1: Joi.string().optional().allow(''),
      type: Joi.string().optional().allow(''),
      line3: Joi.string().optional().allow(''),
      line2: Joi.string().optional().allow(''),
    }),
  ).optional(),
  images: Joi.array().items(
    Joi.object({
      credit: Joi.string().optional().allow(''),
      crops: Joi.array().optional(), // Assuming crops is an array of objects, you can define further if necessary
      title: Joi.string().optional().allow(''),
      altText: Joi.string().optional().allow(''),
      caption: Joi.string().optional().allow(''),
      url: Joi.string().uri().optional().allow(''),
    }),
  ).optional(),
  weatherOverview: Joi.string().optional().allow(''),
  numberOfSitesReservable: Joi.string().optional().allow(''),
  numberOfSitesFirstComeFirstServe: Joi.string().optional().allow(''),
  campsites: Joi.object({
    totalSites: Joi.string().optional().allow(''),
    group: Joi.string().optional().allow(''),
    horse: Joi.string().optional().allow(''),
    tentOnly: Joi.string().optional().allow(''),
    electricalHookups: Joi.string().optional().allow(''),
    rvOnly: Joi.string().optional().allow(''),
    walkBoatTo: Joi.string().optional().allow(''),
    other: Joi.string().optional().allow(''),
  }).optional(),
  accessibility: Joi.object({
    wheelchairAccess: Joi.string().optional().allow(''),
    internetInfo: Joi.string().optional().allow(''),
    cellPhoneInfo: Joi.string().optional().allow(''),
    fireStovePolicy: Joi.string().optional().allow(''),
    rvAllowed: Joi.string().optional().allow(''),
    rvInfo: Joi.string().optional().allow(''),
    rvMaxLength: Joi.string().optional().allow(''),
    additionalInfo: Joi.string().optional().allow(''),
    trailerMaxLength: Joi.string().optional().allow(''),
    adaInfo: Joi.string().optional().allow(''),
    trailerAllowed: Joi.string().optional().allow(''),
    accessRoads: Joi.array().items(Joi.string()).optional(),
    classifications: Joi.array().items(Joi.string()).optional(),
  }).optional(),
});