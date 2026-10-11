-- Each neighbour's activity in French and in English, for the app and the
-- site to show in the reader's language. `activity` keeps what the
-- neighbour typed, in whichever language they typed it; the two new columns
-- hold it written out in each, with typos and capitals tidied. French
-- avoids gendered words ("Médium", "Plaider", "Élève de Merlin"), since the
-- profiles don't say how each neighbour is referred to.
--
-- The translations below cover the 114 neighbours with an avatar and an
-- activity (those the neighbours view shows), as of 2026-10-12. A
-- neighbour signing up later has only `activity` until it is translated.

alter table public.profiles
  add column activity_fr text,
  add column activity_en text;

-- The view gains the two columns at its end (create or replace can only
-- append); its grants stay.
create or replace view public.neighbours as
  select id, first_name, avatar_path, location, activity, created_at, activity_fr, activity_en
  from public.profiles
  where avatar_path is not null;

update public.profiles as p
set activity_fr = t.fr, activity_en = t.en
from (values
  ('0f904dea-6f13-4261-8b2d-da8fc10d3683', 'Manger des M&M''s', 'Eating M&Ms'), -- Eating M&Ms
  ('608b5947-2dcc-4f6e-a5c0-40eba967e551', 'Faire du kayak', 'Kayaking'), -- Kayaking
  ('c41ae810-d5b3-4f96-9237-752cfcf68468', 'Se détendre', 'Chilling'), -- Chilling
  ('dd4c9253-766a-4b06-9e93-6dcf06474c97', 'Faire du shopping', 'Shopping'), -- Shopping
  ('bc27594d-5065-46aa-8c4e-7869e7beb419', 'Lire', 'Reading'), -- Reading
  ('98743d93-3d44-4783-977f-b0d88c44300e', 'Manger des pâtes', 'Eating pasta'), -- Eating pasta
  ('c3665c18-e1ee-499e-9624-bb12aca85417', 'Faire du trading', 'Trading'), -- Trading
  ('603eb904-0f3d-4f19-a828-a290230e3fc9', 'Faire de la plongée', 'Scuba diving'), -- Scuba diving
  ('22d446d9-40e9-4e3c-bfc6-5cced483b3bb', 'Conduire', 'Driving'), -- Driving
  ('6c59cb85-1871-4442-8e59-c25e8608a3bf', 'Rêver', 'Dreaming'), -- Dreaming
  ('33a44ac6-a83a-4047-9cc3-55829d2205da', 'Tricoter', 'Knitting'), -- Knitting
  ('333eb1aa-8231-4a08-a522-eaa442ad618b', 'Boire un double expresso', 'Drinking a double espresso'), -- Drinking a double espresso
  ('7f6a139e-170a-4575-9a9c-87910fb6edf4', 'Conduire une Ferrari', 'Driving a Ferrari'), -- Driving a Ferrari
  ('6586ba66-1603-4f3f-8544-5002c7c26d62', 'Jouer avec un singe', 'Playing with a monkey'), -- Playing with a monkey
  ('1d07c7c4-bee0-4b0d-87da-a2997049852a', 'Lire un livre', 'Reading a book'), -- Reading a book
  ('937e4f3c-aea7-404c-b5f9-b4070379e771', 'Étudier', 'Studying'), -- Studying
  ('f7c7e027-cd36-4e6a-a636-dbbbcd6daf7f', 'Jouer au théâtre', 'Performing in a theatre'), -- Performining in a theatre
  ('7bfae586-1132-4bbe-b864-cf1568f3cdf3', 'Travailler au pub', 'Working at the pub'), -- Working at the pub
  ('837e89ea-1aee-4504-8877-a962ae322897', 'Explorer la jungle', 'Exploring the jungle'), -- Exploring the jungle
  ('2b960c46-1af1-4d06-bcb1-e3ff708c475d', 'Tenir un bouquet de marguerites', 'Holding a bouquet of daisies'), -- Holding a bouquet of daisies
  ('ddb083a6-a8a1-496d-a382-822b948065a7', 'Lire', 'Reading'), -- Reading
  ('dee5d2c5-d272-4b15-b7f4-fdd2cf685297', 'Manger ma main', 'Eating my hand'), -- Eating my hand
  ('e60b58b7-023f-4dbc-a5eb-ead6b1217268', 'Faire pendre un poisson rouge dans ma bouche', 'Dangling a goldfish into my mouth'), -- Dangling a goldfish into my mouth
  ('26c74b79-5b9b-4e73-a340-db7098739600', 'Faire des beats', 'Making beats'), -- Making beats
  ('0fa2a390-cd15-4375-a42f-da4d564b193c', 'Sauter en parachute', 'Skydiving'), -- Skydiving
  ('68d8a8b5-5536-4505-a73e-4a577f59bb3a', 'Plaider', 'Lawyer'), -- Lawyer
  ('694c015b-8f6f-497a-973e-450f69d382a2', 'Jouer aux échecs', 'Playing chess'), -- Playing chess
  ('9e63a0d4-baa3-4d8a-9d52-f377e9735e05', 'Jouer dans un jardin', 'Performing in a garden'), -- Performing in a garden
  ('4b9bcc7e-e3ca-4831-aa17-4610f1ad94b5', 'Jouer de la guitare', 'Playing guitar'), -- Playing guitar
  ('0445463e-00c4-40c3-8047-adec4b4c1932', 'Surfer', 'Surfing'), -- Surfing
  ('9da89d57-59d5-40c0-bb01-c5857de42ec6', 'Chevaucher un paon', 'Riding a peacock'), -- Riding a peacock
  ('5ed7cea1-478e-4a90-b5d7-464e3811d60b', 'Parler de diplomatie', 'Speaking about diplomacy'), -- speaking about diplomacy
  ('723fdd49-5eff-4d53-84d9-5240743a1208', 'Manger du pop-corn', 'Eating popcorn'), -- Eating popcorn
  ('308fae5c-d28b-4638-811f-c753067b55e1', 'Danser sur une baleine', 'Dancing on a whale'), -- Dancing on a whale
  ('06e4b76a-3ced-413b-b8cf-b2b0a65e4e06', 'Skier', 'Skiing'), -- Skiing
  ('99be30a8-a496-448c-b787-b88730635d36', 'Peindre une toile', 'Painting a canvas'), -- Peindre une toile
  ('de0a35f2-6c62-4599-a23a-cada3a328f0b', 'Chevaucher un dauphin', 'Riding a dolphin'), -- Riding a dolphin
  ('b0bb552c-b88b-4e42-952d-28e46dfea9eb', 'Manger', 'Eating'), -- Eating
  ('37857d1f-2077-40d8-b72c-e7a2e3a345db', 'Skier', 'Skiing'), -- Skiing
  ('96d05b49-9594-49c4-af15-b24f7ce4ba8f', 'Tenir des fleurs', 'Holding flowers'), -- holding flowers
  ('fdf72112-1785-4cdf-82b9-643b793d8c5e', 'Faire de la voile', 'Sailing'), -- Sailing
  ('2a6e54ea-9801-43a0-9d13-76f3eb356d64', 'Jouer aux échecs', 'Playing chess'), -- playing chess
  ('bcc2fe8c-ac7e-4f23-b563-616e8f1d63da', 'Fumer une IQOS', 'Smoking an IQOS'), -- Smoking Iqos
  ('e76ac744-d184-47c6-9ad5-8d4f6ce12970', 'Sourire avec des lunettes de ski', 'Smiling in ski goggles'), -- Smiling with ski glasses
  ('8b1ee61b-076a-4918-87d8-011d288cef76', 'Faire la fête', 'Partying'), -- Partying
  ('8b1093c8-d7de-4869-a28d-9b1feef81ad8', 'Deltaplane', 'Hang-gliding'), -- Deltaplane
  ('38756a91-2656-4d00-9bf6-b1de9480c4a3', 'Faire caca', 'Pooping'), -- Pooping
  ('efa8c4a7-6ffc-40ac-8351-83b92e3ac598', 'Boire une bière', 'Drinking beer'), -- Drinking beer
  ('530ad087-dade-4633-9e0f-00aab3b9e7fe', 'Chien', 'Dog'), -- Dog
  ('a32b247c-6369-4dd9-aec3-5feb2c8311fe', 'À la salle de sport', 'At the gym'), -- At the gym
  ('8059516e-db7d-44d1-861f-5403faf7e34a', 'Faire du vélo', 'Riding a bike'), -- Riding a bike
  ('f907b979-ee4e-470a-ade4-bdce17141d98', 'Profiter du soleil', 'Enjoying the sun'), -- Enjoying the sun
  ('3c849efa-e59f-4d89-a962-f8f5dca3d1af', 'Bronzer à la plage', 'Tanning at the beach'), -- Tanning at the beach
  ('bfbe32f1-06c4-488e-b940-b8646b9ec328', 'Compter les moutons', 'Counting sheep'), -- Counting sheep
  ('7177a9f9-bb72-4352-b512-97a638a596ba', 'Profiter de la vie', 'Living life'), -- Living life
  ('e1ef8b76-ab2b-4596-b814-74efb2494fd3', 'Faire du kitesurf', 'Kitesurfing'), -- Kitesurfing
  ('b0566aac-8559-4539-9986-50f53559f897', 'Jouer au volley', 'Playing volleyball'), -- Playing Volleyball
  ('a7c86c41-4f02-4d60-a96b-1a9c9f6fcea7', 'Faire du bénévolat pour les enfants', 'Volunteering for kids'), -- Volunteering for kids
  ('a31acce6-9264-439e-b169-d8f5abda369a', 'Relations presse', 'PR'), -- PR
  ('2b53f691-9054-4b4d-bb33-342e1a34102a', 'Jouer à Clash Royale', 'Playing Clash Royale'), -- Playing Clash Royale
  ('836f2819-8290-4fa1-ae3b-997f8ae86061', 'Parler à des p**ps', 'Talking to p**ps'), -- Talking to p**ps
  ('f0a31117-bbc6-483e-aaff-5dfab43a4db8', 'Manger une glace', 'Eating ice cream'), -- Eating ice-cream
  ('7e146b5e-57c6-46e8-aef2-e16ab69b7591', 'Planer très haut !', 'Riding high!'), -- Riding high !
  ('72414347-1253-4cdd-8199-ddd2f30371f8', 'Lire', 'Reading'), -- Reading
  ('9fb7c270-ca0e-4498-bbad-d5f8e3a7fe5c', 'Manger des raviolis chinois et faire de la physique', 'Eating dumplings and doing physics'), -- Eating dumplings and doing physics
  ('e043d7c1-ba29-410d-b503-1a6fad1cf882', 'Caresser un panda', 'Petting a panda'), -- Petting a panda
  ('f2642f95-2d4c-427a-bb57-b7ca103a063c', 'Mener la grande vie', 'Living large'), -- Living large
  ('3eba9f03-d080-4634-a3cf-64d1e5b1a023', 'Coder', 'Coding'), -- Coding
  ('3b533e17-f669-4a6d-8fc2-355eadf5966d', 'Piloter une F1', 'Driving an F1 car'), -- Driving a f1
  ('0c90df82-23f8-4d6b-ae2f-0a82f4de172f', 'Jouer du piano', 'Playing piano'), -- playing piano
  ('e9807ff3-70ba-418f-91ca-cbc698aec0d2', 'Faire de la boxe', 'Boxing'), -- Boxing
  ('7b789b45-b936-4310-818f-6fffb341036e', 'Jouer au foot', 'Playing football'), -- Playing Football
  ('99521136-79e0-42ee-aa4c-714aa9820fe0', 'Lire le Neighbor', 'Reading the Neighbor'), -- Reading the neighbor
  ('5d085dcb-dd97-42f4-8d45-61c6fed0b47b', 'Danser la salsa', 'Dancing salsa'), -- Dancing Salsa
  ('ac43d337-7025-4dca-b077-a7bf480889fc', 'Faire de la plongée', 'Scuba diving'), -- Scuba diving
  ('d56c53af-5420-4604-9cae-2c5d7d0835b3', 'Chevaucher un cheval violet à trois pattes', 'Riding a three-legged purple horse'), -- Riding a three legged purple horse
  ('e6701a1a-a381-4a2c-842c-6934d37d6aeb', 'Faire du thé pendant que le néant attend poliment', 'Making tea as the void politely waits'), -- Making tea as the void politely waits
  ('e8cfae7b-9cc4-463a-8c3d-17bb1214215d', 'Faire des cupcakes', 'Baking cupcakes'), -- baking cupcakes
  ('9df4abc2-adfe-45d9-810a-72a6a6833043', 'Président', 'President'), -- Président
  ('787bc64c-2993-44bd-af6a-b6af7f7c4205', 'Danser sur de la disco en tenue de Saturday Night Live', 'Dancing to disco in a Saturday Night Live outfit'), -- Dance sur de la disco avec la tenue de saturday Night live
  ('ed8c05fa-7b43-4077-bd13-d857d4a3fe4d', 'Courir pour attraper le train', 'Rushing for the train'), -- Rushing for the train
  ('723c3dad-d9b7-4483-9bd5-f7fae4b1be3b', 'Ne rien faire', 'Idle'), -- Idle
  ('b1ccfc19-cc01-4df2-b7ff-7ebaaab5e80c', 'Médium', 'Psychic'), -- Psychic
  ('9bd1bed4-e441-4aad-8e03-a67487725c8d', 'S''hydrater', 'Hydrating'), -- Hydrating
  ('d4b3961f-d6a9-42b7-a682-f2d914d20c1d', 'Préparer des burritos géants', 'Making monster burritos'), -- Making monster burritos
  ('fdc51c39-d767-422f-ab1c-dca3600a87ef', 'Raconter des blagues', 'Telling jokes'), -- Telling jokes
  ('a5c1e935-dc8c-44e1-a885-32674467aaee', 'Sur la lune', 'Sitting on the moon'), -- Sitting on the moon
  ('7f6520c4-43ed-47ff-90d8-191810ff6730', 'Être le père Noël', 'Being Santa Claus'), -- Being Santa Claus
  ('5217072c-6dba-49e1-ac70-8f81d63d656f', 'Combattre un ours', 'Fighting a bear'), -- Fighting a bear
  ('91c721e4-c157-4b2a-bf0e-44725bd15b7a', 'Lever mon verre', 'Raising my glass'), -- Raising my glass
  ('b5d6079a-c2f4-4e7f-a36f-fee2d3f1f228', 'Voyager', 'Traveling'), -- Traveling
  ('b636abee-dc6d-44e7-943f-56595b8c64f5', 'Deltaplane 2', 'Hang-gliding 2'), -- Deltaplane 2
  ('d1eaa5af-b48c-4223-8b67-685c4d6472aa', 'Écrire', 'Writing'), -- writing
  ('361609f0-d551-4204-a62b-a7e94eaf0e19', 'Dévorer des pâtes', 'Pasta muncher'), -- Pasta muncher
  ('bfb4f652-c58b-40b3-81b3-404281b0e933', 'Fan de montres', 'Watch lover'), -- Watch lover
  ('12db6ec3-f18a-498e-bcef-4989d7555cd5', 'Gagner un marathon', 'Winning a marathon'), -- Winning a marathon
  ('c74783e7-7c80-421c-8860-9728a276be30', 'Empiler les jetons à Vegas', 'Stackin'' chips in Vegas'), -- Stackin' chips at Vegas
  ('a4ddf40b-9a1e-4ea9-a2d3-791c1e4c8736', 'Boire du thé', 'Drinking tea'), -- Drinking tea
  ('9e97f642-907c-4f8a-86b4-78ea4b469c11', 'Lire un livre', 'Reading a book'), -- Reading a book
  ('d4a52d61-b844-46cb-b652-a9c8c86ee507', 'Gagner un Oscar', 'Winning an Oscar'), -- Winning an Oscar
  ('71bfbb2d-d7c7-4bfe-a9d5-8aa2d1aa792e', 'Monter à cheval comme un cow-boy', 'Riding a horse like a cowboy'), -- Riding a horse like a cow-boy
  ('90112471-5a73-4968-9e36-74ec6ce05622', 'Jouer au polo en se déhanchant', 'Playing polo while grooving'), -- playing polo while grooving
  ('884d6f8c-6270-4b97-8835-e327412fa19a', 'Dormir sous le London Bridge', 'Sleeping under London Bridge'), -- Sleeping under london bridge
  ('0485b8fe-bd50-4c15-8c99-4ed4454ea851', 'Journaliste', 'Journalist'), -- Journaliste
  ('bb9caa0c-1569-4ecf-b332-523968f4b2e1', 'Sauver les sirènes', 'Saving mermaids'), -- Sauver les sirenes
  ('60141625-6fa7-43b0-813c-30c409ef79f6', 'Écouter de la musique', 'Listening to music'), -- Listening music
  ('e5c4cfef-aac9-4dc5-9d91-eed932de9aed', 'Élève de Merlin. Paraît-il.', 'Trained by Merlin. Allegedly.'), -- Trained by Merlin. Allegedly.
  ('76120e15-8f80-4a26-a5a6-4ef3b77f76e8', 'Boire un café', 'Drinking coffee'), -- drinking coffee
  ('494c330d-2bf3-4c9f-b797-37d00d9cdce1', 'Parler', 'Talking'), -- Talking
  ('8b8cd1e7-0494-4542-bccd-9b6f84850482', 'Résister à l''envie de couper ma frange', 'Fighting the urge to cut my bangs'), -- Fighting the urge to cut my bangs
  ('4905f9dd-deac-47b9-8ce5-1c7fbfcb037c', 'Faire un bœuf', 'Jamming'), -- jamming
  ('bfc70a2d-764a-4c1f-ad93-2578b2f660e8', 'Fredonner des airs', 'Humming tunes'), -- Humming tunes
  ('560bb3a8-7471-4fe9-8a88-a16036271236', 'Apprendre un talent inutile', 'Learning a useless skill'), -- Learning a useless ability
  ('b45f7ac9-249a-41c6-83ff-a728d51fba55', 'Écrire à la plume d''oie', 'Writing with a quill')  -- Écrire à la plume d'oie
) as t (id, fr, en)
where p.id = t.id::uuid;
