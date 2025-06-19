import { Animal } from '@/types/animals';

export const animals: Animal[] = [
  {
    id: 'flamingo-1',
    name: 'Greater Flamingo',
    coordinates: {
      lat: 23.5,
      lng: -82.3
    },
    image: '/images/animals/flamingo-rosa.jpg',
    description: 'A majestic greater flamingo observed in its natural habitat, displaying its characteristic pink plumage. These remarkable birds get their pink coloration from the carotenoid pigments in the algae and small crustaceans that make up their diet. They are a testament to the delicate synergy between humans and animals that populate the salt marsh, as described in multispecies ethnographic studies.',
    type: 'Wading Bird',
    date: '2024-03-15',
    location: 'Salinas do Samouco salt marsh complex',
    scientificName: 'Phoenicopterus roseus',
    habitat: 'Salt marshes, lagoons, and shallow coastal waters with specific requirements for nesting and feeding areas. They thrive in the intertidal zones where land meets water, particularly in the salt pans that provide both food and protection.',
    diet: 'Small aquatic invertebrates, algae, and small crustaceans. Their specialized beaks are adapted for filter-feeding, allowing them to extract nutrients from the brackish waters of the salt marsh.',
    behavior: 'Known for their distinctive standing on one leg and filter-feeding behavior. They form large colonies during breeding season and engage in synchronized courtship displays. Their presence in the salt marsh is deeply connected to the tidal rhythms, moving between feeding areas based on water levels.',
    conservation: 'While listed as Least Concern globally, local populations face challenges from habitat loss and human disturbance. The Salinas Foundation actively works to protect their breeding and feeding grounds through careful water management and nest protection measures.'
  }
]; 