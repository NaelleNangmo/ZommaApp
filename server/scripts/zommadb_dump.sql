-- =============================================================================
-- ZOMA SARL — Dump complet de la base de données
-- =============================================================================
-- Base       : zommadb
-- PostgreSQL : 16.2
-- Généré le  : 2026-07-11
--
-- UTILISATION
-- -----------
-- Option 1 — Restauration directe (base déjà créée) :
--   psql -U postgres -d zommadb -f zommadb_dump.sql
--
-- Option 2 — Création + restauration en une commande :
--   psql -U postgres -c "CREATE DATABASE zommadb;"
--   psql -U postgres -d zommadb -f zommadb_dump.sql
--
-- Option 3 — Script shell fourni :
--   bash server/scripts/restore_db.sh
--
-- CONTENU
-- -------
--   Tables : depots, fournisseurs, products, users, livreurs,
--            stocks, sales, livraisons, livraison_items
--   Données: 5 dépôts, 5 fournisseurs, 5 produits, 9 utilisateurs,
--            5 livreurs, 17 stocks, ~477 ventes, 30 livraisons
--
-- COMPTES DE DÉMONSTRATION (mot de passe : password)
-- ---------------------------------------------------
--   admin@zoma.com     → Admin Global
--   depot1@zoma.com    → Admin Dépôt Yaoundé
--   depot2@zoma.com    → Admin Dépôt Douala
--   vendeur@zoma.com   → Vendeur
--   livreur@zoma.com   → Livreur
-- =============================================================================

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: depots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.depots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    phone character varying(20) NOT NULL,
    admin_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: fournisseurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fournisseurs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    contact character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: livraison_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.livraison_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    livraison_id uuid,
    product_id uuid,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL
);


--
-- Name: livraisons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.livraisons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fournisseur_id uuid,
    depot_id uuid,
    livreur_id uuid,
    status character varying(50) DEFAULT 'pending'::character varying,
    scheduled_date timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    total_amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT livraisons_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: livreurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.livreurs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    depot_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    fournisseur_id uuid,
    unit character varying(50) NOT NULL,
    prix_achat numeric(10,2) NOT NULL,
    prix_vente numeric(10,2) NOT NULL,
    seuil_stock integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid,
    depot_id uuid,
    vendeur_id uuid,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: stocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stocks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid,
    depot_id uuid,
    quantity integer DEFAULT 0 NOT NULL,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    depot_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin_global'::character varying, 'admin_depot'::character varying, 'vendeur'::character varying, 'livreur'::character varying])::text[])))
);


--
-- Data for Name: depots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.depots (id, name, address, phone, admin_id, is_active, created_at, updated_at) FROM stdin;
5e60d8bc-fec0-48be-bcfd-e95550c3f67d	Dépôt Central Yaoundé	123 Rue de la Réunification, Yaoundé	+237 222 123 456	\N	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
8cecbc4a-6053-431b-b3db-c3f7f508df09	Dépôt Douala	456 Boulevard de la Liberté, Douala	+237 233 654 321	\N	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
cde1f5a5-9dbd-4366-9549-e0e1662a25e0	Dépôt Bafoussam	789 Avenue de l'Indépendance, Bafoussam	+237 244 789 012	\N	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
9b3436a8-a13f-46e3-9607-6426fbdf52ae	Dépôt Garoua	321 Rue du Commerce, Garoua	+237 255 345 678	\N	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
5be172f4-df83-4992-8127-4ce6eebd8bec	Dépôt Bamenda	654 Commercial Avenue, Bamenda	+237 266 901 234	\N	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
\.


--
-- Data for Name: fournisseurs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fournisseurs (id, name, contact, phone, email, is_active, created_at, updated_at) FROM stdin;
4932813e-1ba2-4b1f-b481-077e79c35904	SABC	Jean Dupont	+237 222 111 222	contact@sabc.cm	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
3a97c5ad-5491-48aa-81bc-0d3339ac9d73	Sources du Pays	Marie Nguyen	+237 233 333 444	info@sourcesdupays.cm	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
d9a04f49-a563-4e49-80a3-aaa8a46fac7a	Brasseries du Cameroun	Paul Mbarga	+237 244 555 666	commercial@bc.cm	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	Coca-Cola Cameroun	Sophie Ewondo	+237 255 777 888	ventes@coca-cola.cm	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
0f3813d5-9a82-4a39-84db-a4d9cbdfbac6	Guinness Cameroun	André Fouda	+237 266 999 000	distribution@guinness.cm	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
\.


--
-- Data for Name: livraison_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.livraison_items (id, livraison_id, product_id, quantity, unit_price) FROM stdin;
af960aaa-145a-4f9c-aaed-1e5e9ff5e5df	82825d5c-fd1b-4f94-8894-e1d1b8f28d16	19f142ee-8581-4d0b-be95-e276eff686f4	294	500.00
d030aab7-7953-4330-9d50-55504bae748d	a046faad-4fe6-4ea4-99f6-4903c4fb8817	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	401	600.00
8751b9ef-82c8-45df-8a8e-e1215e47f043	753c7479-6fff-47b4-90b8-4de08a85b4ad	19f142ee-8581-4d0b-be95-e276eff686f4	203	500.00
fd0997d7-d2da-4366-b87c-609a349e76ef	d9936dfc-5a98-43e0-b845-c59617efe325	e6455bda-57fe-42ed-9c34-af24d99011d1	189	300.00
2f7de93c-0bb5-482a-a6c6-9906ae506abb	bd9cee56-8567-4f4e-b583-de3e3e3950bb	8cca89c6-f11d-4843-94ca-3a62aa634b8b	258	450.00
3fcedc78-b189-4886-bc16-532b54c91e12	2f84d073-0196-4f16-9821-0b3a81724635	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	284	600.00
b82635e6-3137-4c19-acef-5eee166301df	e6dbf3bc-1a97-456c-987a-a45973719d52	e6455bda-57fe-42ed-9c34-af24d99011d1	311	300.00
50d4c562-bf68-4ec8-9eee-70433e67605d	77bd069a-daf9-462c-bbde-53285054bf38	2489a5f4-026c-4e98-824e-b33e07fb1ba3	408	200.00
f34654d9-bc93-4fba-98b4-87691fcecf2c	015f605f-0363-4a15-80f3-658781ff2eaf	2489a5f4-026c-4e98-824e-b33e07fb1ba3	424	200.00
a93346b5-df05-4b4e-acf5-42b382b86cf1	3cd8cf6a-3e68-4314-bacf-9aad687f00a0	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	454	600.00
8b9b39d0-16ee-4b90-b8b3-91622cac1d87	d53807eb-8fc6-4927-8d6f-53409f89f42a	19f142ee-8581-4d0b-be95-e276eff686f4	227	500.00
cfd9d3da-630a-4e88-93cb-5b8d0493c54c	874cd07f-645f-41d0-8ad5-b569cdb0fe92	2489a5f4-026c-4e98-824e-b33e07fb1ba3	275	200.00
29fbff5b-f011-4ba5-86db-2499131bea21	e6429a94-74be-442a-8516-68afccfad5d0	19f142ee-8581-4d0b-be95-e276eff686f4	152	500.00
585287d5-8536-4d01-8276-83ba8ad92398	3bf4ef2b-365a-422d-8453-259e0247b419	19f142ee-8581-4d0b-be95-e276eff686f4	460	500.00
1c71f9d5-6f0b-44ee-abfd-beeff7b6bd1a	e5433d0d-3a0c-498e-9233-d46b20abc99e	e6455bda-57fe-42ed-9c34-af24d99011d1	360	300.00
4b159ce5-26e9-48da-b197-ee1d414002bc	75960578-20c7-487d-beba-2094f9894742	19f142ee-8581-4d0b-be95-e276eff686f4	496	500.00
71eb496f-51dd-4bde-9ebf-1362c0e30b16	68c6dd7f-f3c1-471e-bfe5-bf5f17095987	8cca89c6-f11d-4843-94ca-3a62aa634b8b	388	450.00
b50104c5-5ef2-4638-bf6c-31456f6fd7a0	1fee5fa8-aaa2-440c-950a-a129e2804f74	e6455bda-57fe-42ed-9c34-af24d99011d1	255	300.00
8246fc74-a8ef-4c98-b0d0-532439c626e7	6efe5c1f-7dda-4587-a5df-953bd1073fc5	2489a5f4-026c-4e98-824e-b33e07fb1ba3	315	200.00
6bb04e9b-89e9-4083-82bc-5f6e2dce328a	e1244da6-58ce-48b8-9c30-7dffd415931b	e6455bda-57fe-42ed-9c34-af24d99011d1	290	300.00
1c2da726-a9ed-4556-9828-97a0d031ec1e	74abfa7a-ca94-403b-9431-fe3b167de19f	8cca89c6-f11d-4843-94ca-3a62aa634b8b	270	450.00
fe20e129-ddf9-48d7-8b78-b142fb13e959	b9c227cd-0740-410e-818d-57e87dd429f5	2489a5f4-026c-4e98-824e-b33e07fb1ba3	422	200.00
aafc5bd8-dc44-491d-84db-afc166e75f6b	19a76fc4-c47c-4987-8ed6-1b1177829123	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	209	600.00
7324d97d-6163-47d8-80c5-8cf265859def	a995bf71-3982-4c3a-87d7-ee77c8c958c5	e6455bda-57fe-42ed-9c34-af24d99011d1	243	300.00
68cfec68-fd3e-4ab0-8656-5cb9e29badcd	f570c2f4-7517-4c10-837a-beea0f830acf	19f142ee-8581-4d0b-be95-e276eff686f4	401	500.00
cf52d40a-3a8b-44e3-907c-67677672bd91	c77147c9-d948-464a-9baa-870aeb03046c	8cca89c6-f11d-4843-94ca-3a62aa634b8b	264	450.00
bad01e0e-cf3c-44e0-832c-fdc9983a367e	1bb5ca52-c1e1-4a98-9875-9599361bc9eb	2489a5f4-026c-4e98-824e-b33e07fb1ba3	338	200.00
5eec70a1-b4cf-435d-bda1-30e4d8b5c844	8c36c7a7-a115-4d34-96a6-e7ce5f26e947	2489a5f4-026c-4e98-824e-b33e07fb1ba3	384	200.00
8654a9c9-9d96-4d75-a179-e05e1c7979bc	c6d12ba0-c55c-4aef-8579-d95528828f48	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	201	600.00
6956993c-762f-4310-826a-9c969b47e442	3c3777a9-e1ff-4979-9463-8c7ec2e23921	2489a5f4-026c-4e98-824e-b33e07fb1ba3	329	200.00
\.


--
-- Data for Name: livraisons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.livraisons (id, fournisseur_id, depot_id, livreur_id, status, scheduled_date, completed_at, total_amount, created_at, updated_at) FROM stdin;
82825d5c-fd1b-4f94-8894-e1d1b8f28d16	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	8cecbc4a-6053-431b-b3db-c3f7f508df09	4932a205-a265-4cf4-8ab4-79e0cae07fe7	in_progress	2026-05-23 00:13:14.385	\N	147000.00	2026-05-23 00:13:14.385	2026-07-11 00:13:13.067048
a046faad-4fe6-4ea4-99f6-4903c4fb8817	0f3813d5-9a82-4a39-84db-a4d9cbdfbac6	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	b0636396-9fad-46c2-89e6-640302dcb87f	completed	2026-06-18 00:13:14.404	2026-06-19 00:13:14.404	240600.00	2026-06-18 00:13:14.404	2026-07-11 00:13:13.067048
753c7479-6fff-47b4-90b8-4de08a85b4ad	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	8cecbc4a-6053-431b-b3db-c3f7f508df09	4932a205-a265-4cf4-8ab4-79e0cae07fe7	completed	2026-05-14 00:13:14.412	2026-05-15 00:13:14.412	101500.00	2026-05-14 00:13:14.412	2026-07-11 00:13:13.067048
d9936dfc-5a98-43e0-b845-c59617efe325	7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	8cecbc4a-6053-431b-b3db-c3f7f508df09	69d711bc-058d-4186-b2d7-078d6b0fa0fe	in_progress	2026-07-09 00:13:14.417	\N	56700.00	2026-07-09 00:13:14.417	2026-07-11 00:13:13.067048
bd9cee56-8567-4f4e-b583-de3e3e3950bb	4932813e-1ba2-4b1f-b481-077e79c35904	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	05f834b1-f3ff-46f1-9940-025503db637c	completed	2026-05-21 00:13:14.423	2026-05-22 00:13:14.424	116100.00	2026-05-21 00:13:14.423	2026-07-11 00:13:13.067048
2f84d073-0196-4f16-9821-0b3a81724635	0f3813d5-9a82-4a39-84db-a4d9cbdfbac6	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	b0636396-9fad-46c2-89e6-640302dcb87f	completed	2026-05-16 00:13:14.43	2026-05-17 00:13:14.43	170400.00	2026-05-16 00:13:14.43	2026-07-11 00:13:13.067048
e6dbf3bc-1a97-456c-987a-a45973719d52	7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	8cecbc4a-6053-431b-b3db-c3f7f508df09	69d711bc-058d-4186-b2d7-078d6b0fa0fe	completed	2026-06-11 00:13:14.435	2026-06-12 00:13:14.435	93300.00	2026-06-11 00:13:14.435	2026-07-11 00:13:13.067048
77bd069a-daf9-462c-bbde-53285054bf38	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	completed	2026-04-17 00:13:14.44	2026-04-18 00:13:14.44	81600.00	2026-04-17 00:13:14.44	2026-07-11 00:13:13.067048
015f605f-0363-4a15-80f3-658781ff2eaf	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	completed	2026-05-22 00:13:14.446	2026-05-23 00:13:14.446	84800.00	2026-05-22 00:13:14.446	2026-07-11 00:13:13.067048
3cd8cf6a-3e68-4314-bacf-9aad687f00a0	0f3813d5-9a82-4a39-84db-a4d9cbdfbac6	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	b0636396-9fad-46c2-89e6-640302dcb87f	in_progress	2026-04-18 00:13:14.451	\N	272400.00	2026-04-18 00:13:14.451	2026-07-11 00:13:13.067048
d53807eb-8fc6-4927-8d6f-53409f89f42a	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	8cecbc4a-6053-431b-b3db-c3f7f508df09	4932a205-a265-4cf4-8ab4-79e0cae07fe7	pending	2026-07-06 00:13:14.459	\N	113500.00	2026-07-06 00:13:14.459	2026-07-11 00:13:13.067048
874cd07f-645f-41d0-8ad5-b569cdb0fe92	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	completed	2026-07-08 00:13:14.464	2026-07-09 00:13:14.464	55000.00	2026-07-08 00:13:14.464	2026-07-11 00:13:13.067048
e6429a94-74be-442a-8516-68afccfad5d0	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	8cecbc4a-6053-431b-b3db-c3f7f508df09	4932a205-a265-4cf4-8ab4-79e0cae07fe7	pending	2026-06-15 00:13:14.47	\N	76000.00	2026-06-15 00:13:14.47	2026-07-11 00:13:13.067048
3bf4ef2b-365a-422d-8453-259e0247b419	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	8cecbc4a-6053-431b-b3db-c3f7f508df09	4932a205-a265-4cf4-8ab4-79e0cae07fe7	pending	2026-05-22 00:13:14.477	\N	230000.00	2026-05-22 00:13:14.477	2026-07-11 00:13:13.067048
e5433d0d-3a0c-498e-9233-d46b20abc99e	7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	8cecbc4a-6053-431b-b3db-c3f7f508df09	69d711bc-058d-4186-b2d7-078d6b0fa0fe	completed	2026-06-18 00:13:14.484	2026-06-19 00:13:14.484	108000.00	2026-06-18 00:13:14.484	2026-07-11 00:13:13.067048
75960578-20c7-487d-beba-2094f9894742	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	8cecbc4a-6053-431b-b3db-c3f7f508df09	4932a205-a265-4cf4-8ab4-79e0cae07fe7	completed	2026-05-17 00:13:14.489	2026-05-18 00:13:14.489	248000.00	2026-05-17 00:13:14.489	2026-07-11 00:13:13.067048
68c6dd7f-f3c1-471e-bfe5-bf5f17095987	4932813e-1ba2-4b1f-b481-077e79c35904	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	05f834b1-f3ff-46f1-9940-025503db637c	pending	2026-04-19 00:13:14.494	\N	174600.00	2026-04-19 00:13:14.494	2026-07-11 00:13:13.067048
1fee5fa8-aaa2-440c-950a-a129e2804f74	7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	8cecbc4a-6053-431b-b3db-c3f7f508df09	69d711bc-058d-4186-b2d7-078d6b0fa0fe	in_progress	2026-05-13 00:13:14.498	\N	76500.00	2026-05-13 00:13:14.498	2026-07-11 00:13:13.067048
6efe5c1f-7dda-4587-a5df-953bd1073fc5	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	in_progress	2026-06-09 00:13:14.503	\N	63000.00	2026-06-09 00:13:14.503	2026-07-11 00:13:13.067048
e1244da6-58ce-48b8-9c30-7dffd415931b	7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	8cecbc4a-6053-431b-b3db-c3f7f508df09	69d711bc-058d-4186-b2d7-078d6b0fa0fe	completed	2026-06-12 00:13:14.508	2026-06-13 00:13:14.508	87000.00	2026-06-12 00:13:14.508	2026-07-11 00:13:13.067048
74abfa7a-ca94-403b-9431-fe3b167de19f	4932813e-1ba2-4b1f-b481-077e79c35904	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	05f834b1-f3ff-46f1-9940-025503db637c	completed	2026-04-27 00:13:14.512	2026-04-28 00:13:14.512	121500.00	2026-04-27 00:13:14.512	2026-07-11 00:13:13.067048
b9c227cd-0740-410e-818d-57e87dd429f5	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	completed	2026-06-13 00:13:14.516	2026-06-14 00:13:14.516	84400.00	2026-06-13 00:13:14.516	2026-07-11 00:13:13.067048
19a76fc4-c47c-4987-8ed6-1b1177829123	0f3813d5-9a82-4a39-84db-a4d9cbdfbac6	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	b0636396-9fad-46c2-89e6-640302dcb87f	completed	2026-06-19 00:13:14.52	2026-06-20 00:13:14.52	125400.00	2026-06-19 00:13:14.52	2026-07-11 00:13:13.067048
a995bf71-3982-4c3a-87d7-ee77c8c958c5	7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	8cecbc4a-6053-431b-b3db-c3f7f508df09	69d711bc-058d-4186-b2d7-078d6b0fa0fe	pending	2026-06-10 00:13:14.526	\N	72900.00	2026-06-10 00:13:14.526	2026-07-11 00:13:13.067048
f570c2f4-7517-4c10-837a-beea0f830acf	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	8cecbc4a-6053-431b-b3db-c3f7f508df09	4932a205-a265-4cf4-8ab4-79e0cae07fe7	completed	2026-04-19 00:13:14.53	2026-04-20 00:13:14.53	200500.00	2026-04-19 00:13:14.53	2026-07-11 00:13:13.067048
c77147c9-d948-464a-9baa-870aeb03046c	4932813e-1ba2-4b1f-b481-077e79c35904	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	05f834b1-f3ff-46f1-9940-025503db637c	pending	2026-04-17 00:13:14.535	\N	118800.00	2026-04-17 00:13:14.535	2026-07-11 00:13:13.067048
1bb5ca52-c1e1-4a98-9875-9599361bc9eb	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	completed	2026-04-15 00:13:14.539	2026-04-16 00:13:14.539	67600.00	2026-04-15 00:13:14.539	2026-07-11 00:13:13.067048
8c36c7a7-a115-4d34-96a6-e7ce5f26e947	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	completed	2026-06-14 00:13:14.544	2026-06-15 00:13:14.544	76800.00	2026-06-14 00:13:14.544	2026-07-11 00:13:13.067048
c6d12ba0-c55c-4aef-8579-d95528828f48	0f3813d5-9a82-4a39-84db-a4d9cbdfbac6	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	b0636396-9fad-46c2-89e6-640302dcb87f	completed	2026-05-29 00:13:14.549	2026-05-30 00:13:14.549	120600.00	2026-05-29 00:13:14.549	2026-07-11 00:13:13.067048
3c3777a9-e1ff-4979-9463-8c7ec2e23921	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	d906eff4-e855-464f-85a4-fd2186eaaaab	completed	2026-06-21 00:13:14.553	2026-06-22 00:13:14.553	65800.00	2026-06-21 00:13:14.553	2026-07-11 00:13:13.067048
\.


--
-- Data for Name: livreurs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.livreurs (id, name, phone, email, depot_id, is_active, created_at, updated_at) FROM stdin;
05f834b1-f3ff-46f1-9940-025503db637c	Paul Mbarga	+237 677 123 456	paul.mbarga@zoma.com	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
d906eff4-e855-464f-85a4-fd2186eaaaab	Sophie Ewondo	+237 655 987 654	sophie.ewondo@zoma.com	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
69d711bc-058d-4186-b2d7-078d6b0fa0fe	André Fouda	+237 699 111 222	andre.fouda@zoma.com	8cecbc4a-6053-431b-b3db-c3f7f508df09	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
4932a205-a265-4cf4-8ab4-79e0cae07fe7	Marie Nkomo	+237 677 333 444	marie.nkomo@zoma.com	8cecbc4a-6053-431b-b3db-c3f7f508df09	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
b0636396-9fad-46c2-89e6-640302dcb87f	Jean Talla	+237 655 555 666	jean.talla@zoma.com	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, fournisseur_id, unit, prix_achat, prix_vente, seuil_stock, is_active, created_at, updated_at) FROM stdin;
8cca89c6-f11d-4843-94ca-3a62aa634b8b	Castel Beer 65cl	4932813e-1ba2-4b1f-b481-077e79c35904	bouteille	450.00	650.00	50	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
2489a5f4-026c-4e98-824e-b33e07fb1ba3	Eau Sources du Pays 1.5L	3a97c5ad-5491-48aa-81bc-0d3339ac9d73	bouteille	200.00	300.00	100	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
e6455bda-57fe-42ed-9c34-af24d99011d1	Coca Cola 50cl	7e088df1-5c04-46f8-a5e4-d44e6ca9ca52	bouteille	300.00	450.00	75	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
19f142ee-8581-4d0b-be95-e276eff686f4	33 Export 65cl	d9a04f49-a563-4e49-80a3-aaa8a46fac7a	bouteille	500.00	700.00	40	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	Guinness 50cl	0f3813d5-9a82-4a39-84db-a4d9cbdfbac6	bouteille	600.00	850.00	30	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, product_id, depot_id, vendeur_id, quantity, unit_price, total_amount, created_at) FROM stdin;
e946a8bb-5795-43bf-a2e0-a14bef1a87a8	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	24	650.00	15600.00	2026-07-09 21:30:57.123851
ca4cfc25-1e50-472f-a4c5-2ac9e28c068a	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	48	300.00	14400.00	2026-07-09 21:30:57.123851
32c40675-34f8-48c0-b833-f29327084ffb	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	12	450.00	5400.00	2026-07-09 21:30:57.123851
77c1bb6e-2219-4098-b320-12d6a074db94	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	650.00	23400.00	2026-07-09 21:30:57.123851
b8bad52f-19ac-433d-a545-ff08b02df951	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	700.00	12600.00	2026-07-09 21:30:57.123851
3accad2d-f9ff-475c-8179-abaa645c82d0	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	44	450.00	19800.00	2026-01-12 00:13:13.165
587f0725-b8d4-4f1d-8948-65076f16b889	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	25	300.00	7500.00	2026-01-12 00:13:13.175
f7e9b312-baaf-445d-8274-23f3d25371ac	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	40	300.00	12000.00	2026-01-12 00:13:13.179
198f4bc8-91a0-4259-ac9d-1cc698f1e48e	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	48	450.00	21600.00	2026-01-12 00:13:13.182
615078fe-7021-4cd9-b4a6-9cb3486fb537	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	28	700.00	19600.00	2026-01-13 00:13:13.185
99a5961c-c57f-436d-be32-3fdc5644c5cc	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	16	650.00	10400.00	2026-01-13 00:13:13.189
80ed5c4e-5c3c-45d4-94df-29c8eb9363ba	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	45	650.00	29250.00	2026-01-13 00:13:13.193
5e64b489-6e6f-49bb-b826-2dd056b4e468	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	28	650.00	18200.00	2026-01-14 00:13:13.195
3dcd757e-208a-4d74-b629-09f1c69d52fd	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	38	650.00	24700.00	2026-01-14 00:13:13.198
a22f94f8-f29d-41d8-9613-ea68b0b38624	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	8	300.00	2400.00	2026-01-15 00:13:13.201
f7540b30-ea86-4b71-ab62-d30a69e5a91a	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	31	700.00	21700.00	2026-01-15 00:13:13.204
a8d573c1-0370-43d7-acf4-cec42ee95def	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	48	700.00	33600.00	2026-01-15 00:13:13.206
06c80a05-92c5-4e7e-ad4f-8a322ac173ee	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	450.00	16200.00	2026-01-15 00:13:13.21
5559946d-0269-4d76-80c0-d25bdbef26c6	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	21	700.00	14700.00	2026-01-16 00:13:13.212
a3d6b78b-1c23-4b08-8c14-ce6d4ad943f4	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	42	300.00	12600.00	2026-01-17 00:13:13.214
88237686-9135-4e46-8186-bc65001272b1	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	18	300.00	5400.00	2026-01-18 00:13:13.216
40708bca-e691-454a-bd5e-7d90d1ee43fd	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	37	650.00	24050.00	2026-01-18 00:13:13.219
a525e94b-ffb1-414f-9a5d-1d030682832d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	9	300.00	2700.00	2026-01-19 00:13:13.222
12286517-5c7e-450c-8046-d18afc42f1c2	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	31	300.00	9300.00	2026-01-19 00:13:13.225
d3ac1d44-fc88-4434-b842-12d65904391a	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	48	300.00	14400.00	2026-01-19 00:13:13.228
366c0c23-de61-40bb-b42a-4a11d6a58e71	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	46	850.00	39100.00	2026-01-19 00:13:13.23
92317962-4a74-48b1-bc19-7d4b03b139c6	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	36	650.00	23400.00	2026-01-20 00:13:13.233
7bb9e991-0e7f-4e4f-81f7-d3f6af6fd083	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	22	650.00	14300.00	2026-01-20 00:13:13.235
831ce298-bbfc-411a-b882-e4d2cfc9d547	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	10	300.00	3000.00	2026-01-20 00:13:13.237
bedb6f08-e63e-43b4-8303-42b10820b278	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	38	650.00	24700.00	2026-01-21 00:13:13.239
c99f3d04-77e1-489d-b62f-6cb6de5a8766	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	45	300.00	13500.00	2026-01-21 00:13:13.242
27d8fe81-75e3-4c18-b050-d26b0321b8f9	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	23	300.00	6900.00	2026-01-21 00:13:13.244
9beaa883-1d0b-4868-aa4a-34d2ac0e0614	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	19	700.00	13300.00	2026-01-22 00:13:13.247
3bd9a5a1-e3b6-4345-81e1-4d020e632a33	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	41	450.00	18450.00	2026-01-22 00:13:13.249
e7a6545c-a0a9-4572-ac27-a438794cb57b	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	43	650.00	27950.00	2026-01-22 00:13:13.252
59d691f3-e4d2-4d67-b490-9e1b3982e1ed	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	45	450.00	20250.00	2026-01-23 00:13:13.254
a4e4fadd-afd4-4205-924e-55bfbd8e36e7	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	26	450.00	11700.00	2026-01-24 00:13:13.256
e0db4031-c53e-4520-89e3-217fb0ccb68a	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	20	850.00	17000.00	2026-01-24 00:13:13.259
891cad67-bc8e-4ccf-9758-b708993207d2	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	19	450.00	8550.00	2026-01-25 00:13:13.261
d7626875-a9fc-474b-a2c2-19ae4ad9ba41	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	17	650.00	11050.00	2026-01-25 00:13:13.263
8151208d-18e2-4fcd-8ea2-8c5b9cff2797	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	37	450.00	16650.00	2026-01-26 00:13:13.266
21610231-b1bb-4dfb-931a-f2c935615f5b	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	29	700.00	20300.00	2026-01-26 00:13:13.268
ba36d72d-6a2b-481f-97e4-fcf77a4733d7	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	18	650.00	11700.00	2026-01-26 00:13:13.27
81158edd-ca55-4cc4-8dfb-2a892a37ef17	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	7	700.00	4900.00	2026-01-26 00:13:13.272
c1f56acc-7247-4897-beb3-f0f920e5199c	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	39	450.00	17550.00	2026-01-27 00:13:13.275
5f56adc7-4505-4109-9b81-89a701bead34	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	7	300.00	2100.00	2026-01-27 00:13:13.279
a02e04d2-51b6-49cd-8eeb-1e0387e56682	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	6	650.00	3900.00	2026-01-27 00:13:13.283
3fd02b8b-8333-484e-9799-5f5a8d298200	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	31	700.00	21700.00	2026-01-28 00:13:13.286
1cbdc504-8413-468b-a603-85f57c0d62e6	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	37	450.00	16650.00	2026-01-28 00:13:13.288
29be5498-4826-4236-9f5f-d77e3c400df5	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	14	650.00	9100.00	2026-01-28 00:13:13.29
4f2674aa-5dd4-41a0-bc43-844aec492a3c	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	26	450.00	11700.00	2026-01-28 00:13:13.294
0a2942ea-2344-45f5-9e46-0f963669f7fd	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	31	700.00	21700.00	2026-01-29 00:13:13.297
59ba8a0f-6254-4044-8923-4713046b792c	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	33	300.00	9900.00	2026-01-30 00:13:13.299
f8b204cb-2639-4ad9-aa1e-b9be36597011	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	14	700.00	9800.00	2026-01-30 00:13:13.302
a7476908-ad11-46ab-85b7-78662a119195	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	9	300.00	2700.00	2026-01-30 00:13:13.305
28e816ea-f81b-4827-acfa-27c1bbe84ba1	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	41	850.00	34850.00	2026-01-31 00:13:13.308
0b5d967a-ca88-4d5a-8ac4-b7f5f165140d	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	41	650.00	26650.00	2026-01-31 00:13:13.312
66f28420-8103-45d3-a1c7-bc966aeca3fc	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	35	850.00	29750.00	2026-01-31 00:13:13.315
9170abf0-0365-4df2-a52c-cd3386ce0e8f	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	850.00	15300.00	2026-02-01 00:13:13.318
fd5220ea-9725-44d6-9b25-9edd5cc8e86d	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	24	450.00	10800.00	2026-02-01 00:13:13.321
bf6cdb7e-5d7b-4a53-89cd-641e5b7fb981	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	13	300.00	3900.00	2026-02-01 00:13:13.325
1b196c8e-ea56-4d02-a13b-caf9ccfab531	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	28	700.00	19600.00	2026-02-01 00:13:13.328
ca5e3bb6-25de-4126-9605-3337a195a9cf	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	47	300.00	14100.00	2026-02-02 00:13:13.331
bfbf0134-3e2a-4032-a932-94b975b50382	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	12	700.00	8400.00	2026-02-02 00:13:13.334
fb81bdf7-b6b6-4a70-9cb3-7defada626ae	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	34	850.00	28900.00	2026-02-03 00:13:13.336
eb9f1145-4f0b-4a04-885c-79df74e1108d	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	6	450.00	2700.00	2026-02-04 00:13:13.338
20a8d46c-f717-4bcf-b1d0-869c21ef6e47	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	31	850.00	26350.00	2026-02-04 00:13:13.341
449d187d-aee1-442f-9e01-31be59786230	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	25	850.00	21250.00	2026-02-04 00:13:13.344
970fff0c-f746-4513-871a-e90e88dcbb89	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	12	300.00	3600.00	2026-02-05 00:13:13.349
1248d128-0e4c-4f34-bee3-a5607d2b60e2	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	11	650.00	7150.00	2026-02-05 00:13:13.352
0fb69ef3-9e68-4205-a6da-c1ffa90a283c	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	15	450.00	6750.00	2026-02-06 00:13:13.354
34cd747f-3261-4b86-9584-e8cd29c6569a	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	11	300.00	3300.00	2026-02-07 00:13:13.36
d806a51a-eaed-432a-a320-97d2c90b574c	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	8	700.00	5600.00	2026-02-07 00:13:13.363
3f8a5999-e614-4c2f-a29c-71b1315a7abd	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	9	450.00	4050.00	2026-02-08 00:13:13.365
629e681b-c6e3-4089-92da-6ee390b73d6e	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	10	700.00	7000.00	2026-02-08 00:13:13.367
c7e96c11-9fa0-4055-a6ba-86ffb56d51e2	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	23	700.00	16100.00	2026-02-09 00:13:13.37
e19de4b8-9b33-48e2-b6f8-c7053bc1ff10	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	14	450.00	6300.00	2026-02-09 00:13:13.372
38867fd2-8733-4b12-86ea-49f59343d3b3	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	26	300.00	7800.00	2026-02-10 00:13:13.376
1d042c07-1d44-48b4-8e54-0b1db45288d2	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	7	650.00	4550.00	2026-02-11 00:13:13.379
14700f03-95be-424d-acfe-2cbc6f47e128	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	33	700.00	23100.00	2026-02-11 00:13:13.381
dd0a625f-8e10-417d-b17f-a33bac99db6d	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	38	850.00	32300.00	2026-02-11 00:13:13.384
d3d6f891-26c5-4f7c-b644-1b8762b28775	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	40	300.00	12000.00	2026-02-11 00:13:13.386
5be4b2d5-287f-4973-a7e7-8b94987614f3	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	47	300.00	14100.00	2026-02-12 00:13:13.389
a19c3077-6787-42e5-82cb-57350513f3fc	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	28	850.00	23800.00	2026-02-12 00:13:13.394
b4338aed-7684-453a-98a4-c1d996318e12	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	39	450.00	17550.00	2026-02-13 00:13:13.396
77bbdb6b-bcf8-45d6-b9c3-a941c60f5290	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	450.00	8100.00	2026-02-13 00:13:13.398
04b790d0-4f96-47ad-8794-2f70d3f6be84	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	16	850.00	13600.00	2026-02-13 00:13:13.4
dfaf81b2-4f4e-495d-9242-5cbe4c5cf874	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	42	850.00	35700.00	2026-02-14 00:13:13.403
d3a06071-9f0d-45aa-b61a-cbab308dd5a7	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	36	450.00	16200.00	2026-02-15 00:13:13.405
d530e3b0-c022-462c-965e-d044139e7d75	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	6	450.00	2700.00	2026-02-15 00:13:13.409
009e8194-4217-48b2-8ad8-8d15fdbd5278	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	44	850.00	37400.00	2026-02-16 00:13:13.413
f53e3dec-609f-4646-aa7d-4629342e76f3	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	6	850.00	5100.00	2026-02-16 00:13:13.415
75f34de6-32d7-4ffd-9b84-fbe758f2c8c7	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	23	650.00	14950.00	2026-02-16 00:13:13.417
8d9c028d-a75f-4fc0-9f2c-013787512373	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	21	700.00	14700.00	2026-02-16 00:13:13.419
0d3cbc03-6809-4227-98b0-5c98940a2b42	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	24	300.00	7200.00	2026-02-17 00:13:13.421
37a320f1-a002-42fb-8d96-e314db6058fa	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	6	300.00	1800.00	2026-02-18 00:13:13.423
8e33a0d5-400a-4e46-8dd2-779cb5519ca1	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	15	300.00	4500.00	2026-02-18 00:13:13.426
9a2ea64a-4ef6-451e-b937-099c926057c0	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	8	850.00	6800.00	2026-02-18 00:13:13.429
0bd5f095-bc49-42c8-bd06-8126200b5f2d	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	13	700.00	9100.00	2026-02-19 00:13:13.431
8dd15d80-7fa6-4978-adc6-ef2e51d84a8a	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	16	650.00	10400.00	2026-02-19 00:13:13.433
4064162c-7a8a-4ac7-99c9-90daa4b85647	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	22	850.00	18700.00	2026-02-19 00:13:13.435
8edfafd5-c8b1-436f-874f-6aa9b57b2ef6	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	14	300.00	4200.00	2026-02-19 00:13:13.437
32394b49-9648-4fbd-8222-86be12eb66af	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	43	300.00	12900.00	2026-02-20 00:13:13.439
fec9958d-a05c-4683-b20e-5fad95cb3847	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	16	700.00	11200.00	2026-02-21 00:13:13.442
01fa335c-7ced-4557-979f-223bc21c0ad0	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	7	300.00	2100.00	2026-02-21 00:13:13.445
b167da72-ad04-4313-90e0-59442b38672d	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	33	850.00	28050.00	2026-02-22 00:13:13.447
68cfe76b-a6fe-43d1-8753-80084d021aa0	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	43	850.00	36550.00	2026-02-23 00:13:13.45
d00a77a0-9ef5-41a0-a904-b913bf31f320	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	37	450.00	16650.00	2026-02-23 00:13:13.453
46899b8e-0c33-4de7-bf91-f57bd672d1a1	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	28	650.00	18200.00	2026-02-23 00:13:13.456
d90e314f-5923-457a-813c-c31ab5f7eb93	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	11	300.00	3300.00	2026-02-24 00:13:13.459
f64d7f04-e350-4fa0-92b3-6b74b5e6ca7a	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	45	300.00	13500.00	2026-02-24 00:13:13.462
6d89cb65-ad7e-479b-8490-6f47d86adaab	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	31	450.00	13950.00	2026-02-25 00:13:13.465
5c532cb2-4475-4881-87d8-6ebfd6872d9d	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	37	850.00	31450.00	2026-02-25 00:13:13.467
f4cb0706-bb0e-41f3-88e6-1e61d9b15dca	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	41	850.00	34850.00	2026-02-25 00:13:13.469
e9977064-3ef0-4a1e-b26d-19539c00cb48	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	27	300.00	8100.00	2026-02-25 00:13:13.471
4df55a43-9ead-4ec7-82f7-383395cb869e	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	16	450.00	7200.00	2026-02-26 00:13:13.474
db3f9c88-e34f-475a-8d67-b7dab2509bc6	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	21	850.00	17850.00	2026-02-26 00:13:13.476
d171feda-c3d9-4447-baa7-5f0eb8d0a049	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	10	700.00	7000.00	2026-02-26 00:13:13.479
3bc5f219-a6fc-4102-85a5-ac96ed7da5fd	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	42	650.00	27300.00	2026-02-27 00:13:13.482
657a5f59-9e90-44b0-bd88-454e957a68b8	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	22	300.00	6600.00	2026-02-28 00:13:13.484
41a6c29f-db0e-43a3-867c-50ad08e42266	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	19	700.00	13300.00	2026-02-28 00:13:13.488
5603fa4a-32c6-46c2-853b-49f653101e90	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	46	300.00	13800.00	2026-03-01 00:13:13.491
fb4bcc0d-e57a-48ba-90f8-a206c47a28ae	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	9	650.00	5850.00	2026-03-02 00:13:13.494
240041bf-f230-4f63-933d-1676f09db572	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	13	850.00	11050.00	2026-03-03 00:13:13.496
bd0883f0-d1ee-402c-9b7f-a641263560f3	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	40	450.00	18000.00	2026-03-03 00:13:13.498
f36079eb-76a1-4c0f-9037-0631b0c696c2	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	31	300.00	9300.00	2026-03-03 00:13:13.5
53a1370c-01b4-480d-acd4-543ff167eab5	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	21	300.00	6300.00	2026-03-03 00:13:13.502
85c30f72-1535-4c91-be9e-85f645e6752f	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	36	300.00	10800.00	2026-03-04 00:13:13.505
6d71be7f-fa9c-40e9-9d9d-e2931d89b42d	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	35	700.00	24500.00	2026-03-04 00:13:13.508
d8930e2d-4d49-4f52-a36d-1cb91597f761	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	30	450.00	13500.00	2026-03-05 00:13:13.51
9533e5f5-d01e-48a2-8424-c3dcb31dc07e	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	12	450.00	5400.00	2026-03-06 00:13:13.512
15efa7a1-0d00-44e7-8765-75ef659ae9c1	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	34	450.00	15300.00	2026-03-06 00:13:13.515
ac34b720-fbe1-4dce-bee2-d58c600d7b43	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	23	700.00	16100.00	2026-03-07 00:13:13.518
bc44bfac-627d-4924-ba78-a47da2a9aa30	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	45	650.00	29250.00	2026-03-07 00:13:13.521
ca5a70f8-0bed-48c0-8beb-f5d716452082	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	31	300.00	9300.00	2026-03-07 00:13:13.524
bd6ad71d-d73d-4e9a-bac7-a94f19f6e564	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	37	650.00	24050.00	2026-03-07 00:13:13.526
11190a5f-8279-43dc-a650-3ba8cdf114ab	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	850.00	15300.00	2026-03-08 00:13:13.529
1bb4f63a-f922-4941-82ef-77cddfefd517	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	26	850.00	22100.00	2026-03-08 00:13:13.531
e0178b3f-35be-49b6-85a0-2ab5f60041bb	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	34	850.00	28900.00	2026-03-08 00:13:13.533
782b7fa1-d492-4f29-b875-0147c9938a68	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	10	850.00	8500.00	2026-03-09 00:13:13.535
d4906382-fab2-4582-8c3f-399c48a6ba1b	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	42	650.00	27300.00	2026-03-09 00:13:13.537
74f6b912-6cc8-4448-9dc3-0be90c735121	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	12	650.00	7800.00	2026-03-09 00:13:13.539
5f0d455a-38c7-4bb1-97ea-8dcf0178ca64	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	47	300.00	14100.00	2026-03-10 00:13:13.543
21d92e24-6c83-4f50-ad2a-35bfe69650a6	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	47	300.00	14100.00	2026-03-10 00:13:13.546
63581e52-b72c-48f8-a8a1-07ea3a37bb80	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	42	850.00	35700.00	2026-03-11 00:13:13.549
50adc23e-3488-4e76-9c91-b093747c417f	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	33	700.00	23100.00	2026-03-11 00:13:13.551
e2c67d1c-bdaf-4094-bb9c-569a4074a0d2	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	44	450.00	19800.00	2026-03-11 00:13:13.553
741feb6b-2156-4af9-8935-168c2a57044c	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	21	700.00	14700.00	2026-03-12 00:13:13.555
cb302bf4-6dfc-4591-ba2e-a1d229ac4014	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	19	450.00	8550.00	2026-03-12 00:13:13.559
9fb7fb82-d366-4b43-8aa0-59613227fac6	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	26	650.00	16900.00	2026-03-13 00:13:13.561
57f9cf45-9143-4042-a589-a43f38ed2c80	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	9	650.00	5850.00	2026-03-13 00:13:13.563
796c1a53-d3c9-4324-8647-ab4cd11cc747	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	42	850.00	35700.00	2026-03-13 00:13:13.565
d7367b43-9b6c-482d-a336-202f7735df5e	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	41	850.00	34850.00	2026-03-13 00:13:13.568
35e25be6-9f7c-4c29-b2b2-33daff543cfe	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	28	850.00	23800.00	2026-03-14 00:13:13.57
4430361e-6966-4a93-a34f-9f507e3c06e8	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	23	650.00	14950.00	2026-03-15 00:13:13.572
eb14f5b5-fb9d-4697-867e-c35af8134951	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	15	650.00	9750.00	2026-03-16 00:13:13.574
898585cf-68b8-4109-8b57-630baaf6e51d	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	22	850.00	18700.00	2026-03-16 00:13:13.577
7199e0a3-3663-4ebc-80c2-dcd9f93d438c	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	18	700.00	12600.00	2026-03-16 00:13:13.579
91c1df3d-01a1-41e0-925e-458b366207ca	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	11	300.00	3300.00	2026-03-16 00:13:13.581
c83e135f-23e0-475f-b078-204dfce74b9e	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	25	700.00	17500.00	2026-03-17 00:13:13.583
c72dcb1c-618d-427e-bb03-d301f04b38bf	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	12	300.00	3600.00	2026-03-17 00:13:13.586
3de392bc-da27-4b97-b9cb-1778480e208e	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	47	650.00	30550.00	2026-03-18 00:13:13.587
ac8ee106-22f2-4c13-872b-fe6fcd7f9748	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	6	650.00	3900.00	2026-03-18 00:13:13.589
9a4123b3-ea6b-4796-9a67-ef71a635b68b	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	21	700.00	14700.00	2026-03-18 00:13:13.593
4b3fc2c0-62d4-4370-80ca-4d8e4b4660e2	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	43	300.00	12900.00	2026-03-19 00:13:13.597
bf9f9de5-0481-437b-9b22-2000a508a55f	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	30	450.00	13500.00	2026-03-19 00:13:13.6
1e66a3c9-d84a-49b4-b8d2-bbd91616b875	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	24	650.00	15600.00	2026-03-19 00:13:13.602
a3ad90fd-308d-4f78-a748-2a518b335796	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	450.00	8100.00	2026-03-19 00:13:13.604
608781f1-cf23-4020-a971-476c4018b8df	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	16	450.00	7200.00	2026-03-20 00:13:13.606
61b9c1e5-2b3d-43c0-b4f1-47523d3a5b0e	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	700.00	12600.00	2026-03-20 00:13:13.608
430be600-d63d-42e8-873e-97104ac81c7c	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	38	850.00	32300.00	2026-03-21 00:13:13.61
c942135d-bd10-455f-b1a5-f48562f5f598	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	40	850.00	34000.00	2026-03-21 00:13:13.613
d891bcb8-b3cd-44d3-a3c7-e9bc7937e7dc	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	8	850.00	6800.00	2026-03-21 00:13:13.615
557df3e9-e942-41c0-a6ef-4a6e8002ba92	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	13	300.00	3900.00	2026-03-22 00:13:13.617
57db93a7-227b-4ae9-a066-34502635778c	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	40	450.00	18000.00	2026-03-22 00:13:13.619
e0c6bf58-c930-4ffb-90b6-3d5a3289e192	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	48	300.00	14400.00	2026-03-22 00:13:13.621
9366e287-8126-4c4f-91c8-89cee44a5c85	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	32	850.00	27200.00	2026-03-22 00:13:13.623
584f1818-ceb5-4325-a5d3-1fbf941df75f	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	23	300.00	6900.00	2026-03-23 00:13:13.627
b3df37c7-9700-47ad-ab56-66699a85ecc0	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	34	300.00	10200.00	2026-03-23 00:13:13.63
2cf1c880-bd1d-40a5-9f44-97198d86f892	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	37	300.00	11100.00	2026-03-24 00:13:13.632
afddf1db-0410-4278-8ee5-2ffccea20b2f	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	19	700.00	13300.00	2026-03-25 00:13:13.634
53dced7d-c62f-41ed-8c8d-2876ec15d73a	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	7	650.00	4550.00	2026-03-25 00:13:13.636
d789b248-0e74-49fc-a81f-92f140934500	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	37	850.00	31450.00	2026-03-25 00:13:13.638
69987084-1056-4be6-9e6e-af53a76fbe5b	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	41	850.00	34850.00	2026-03-26 00:13:13.64
59c65378-5864-4e2c-b3d0-5b7acc632df5	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	44	450.00	19800.00	2026-03-27 00:13:13.645
9c7ff634-6fd7-4aaa-88f4-02906135ddc0	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	47	650.00	30550.00	2026-03-27 00:13:13.648
d307db59-449a-496f-a72f-b0d20c0644c7	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	45	700.00	31500.00	2026-03-27 00:13:13.65
5600d0b8-79c1-4401-b353-77c241b85cd9	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	8	700.00	5600.00	2026-03-27 00:13:13.652
90483234-aa42-4c3f-b66e-0e68e5bd99ff	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	450.00	8100.00	2026-03-28 00:13:13.654
d9d553be-bacc-4567-be9b-612b5a103c72	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	14	300.00	4200.00	2026-03-28 00:13:13.656
9322c818-3303-4e3a-bf6a-14e3960c0f3c	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	32	650.00	20800.00	2026-03-28 00:13:13.66
c1f39069-c743-4ae4-bf69-f160da5dd9fe	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	35	700.00	24500.00	2026-03-29 00:13:13.663
2e93842e-999d-4242-802c-9c592c0e6577	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	13	700.00	9100.00	2026-03-30 00:13:13.665
92b7ba9d-67db-4f1c-8852-54afbb2791f8	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	43	450.00	19350.00	2026-03-30 00:13:13.667
79560aa9-c6d6-43bb-a326-a78d64b60a2b	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	36	650.00	23400.00	2026-03-30 00:13:13.669
f366b3aa-3f32-48fd-b1e0-4d1332e6e8da	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	450.00	16200.00	2026-03-30 00:13:13.671
c0d9460b-59f1-4e4a-b790-0d1fef8d09fc	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	37	850.00	31450.00	2026-03-31 00:13:13.675
dcb0ba63-2c61-47e6-9e95-1946684fca93	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	9	650.00	5850.00	2026-03-31 00:13:13.678
41fe1593-3007-4894-bac7-5deb492203ae	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	18	450.00	8100.00	2026-03-31 00:13:13.681
87af67c3-8e3b-4fce-9bda-9c67b9c0076d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	41	300.00	12300.00	2026-04-01 00:13:13.683
9a36c0d6-085e-4f63-bc4d-6ab2cd672c6d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	13	300.00	3900.00	2026-04-01 00:13:13.685
ae9a3c3a-c17c-4ebb-b93d-73dddbde39bd	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	21	300.00	6300.00	2026-04-01 00:13:13.687
88759fdc-0e9c-4618-b0b7-e3cd27c9be85	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	7	700.00	4900.00	2026-04-02 00:13:13.691
6279d1ed-e251-41d4-a944-1e8a90ca3409	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	13	300.00	3900.00	2026-04-02 00:13:13.694
9b270082-29a1-4a84-8850-4b5630078bb9	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	8	450.00	3600.00	2026-04-02 00:13:13.697
53d34c7d-0034-4856-94c2-5bf4b8c90dc0	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	27	300.00	8100.00	2026-04-03 00:13:13.699
4f37c33b-25d7-4180-9bd0-29b38057ee60	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	35	650.00	22750.00	2026-04-03 00:13:13.702
d1a48a84-886a-47df-a51d-4a29649a1b75	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	26	650.00	16900.00	2026-04-04 00:13:13.705
be14f01c-d339-45b1-a62e-27eeee9dce6e	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	31	300.00	9300.00	2026-04-04 00:13:13.709
c6478ab9-0d37-4528-bce1-dd46527c859f	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	28	450.00	12600.00	2026-04-04 00:13:13.712
47bd32fb-09c3-4e55-b97d-1f2405f00f12	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	40	300.00	12000.00	2026-04-04 00:13:13.714
c4ff96b7-3190-4ac2-bb98-374f3665b3af	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	6	450.00	2700.00	2026-04-05 00:13:13.716
077ec405-e528-4ceb-af60-6d1ad2c6f5b2	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	35	650.00	22750.00	2026-04-05 00:13:13.718
d21736e1-fda8-4f08-9703-7b1571e74bd7	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	46	300.00	13800.00	2026-04-05 00:13:13.721
edd80362-00af-4952-a381-a9bd6b7fdb2c	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	46	650.00	29900.00	2026-04-05 00:13:13.725
8e809ef0-91c0-4aef-bb32-a2cef158bee7	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	32	850.00	27200.00	2026-04-06 00:13:13.728
2b4cf095-0ebe-497c-8cbd-c20a74459382	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	11	700.00	7700.00	2026-04-07 00:13:13.73
2883aa94-6420-4542-a7a8-1752b4fa29df	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	29	650.00	18850.00	2026-04-07 00:13:13.733
8902745d-0499-49b8-944e-5746aa795f77	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	43	700.00	30100.00	2026-04-08 00:13:13.736
cf85cee4-a642-431f-b8c2-8c8aa1ab3b08	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	27	700.00	18900.00	2026-04-08 00:13:13.739
a115bd09-bc5c-400f-82ec-18e0762268ea	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	31	700.00	21700.00	2026-04-09 00:13:13.742
8c7ba481-5259-424b-a5c8-95d1cb1b6ebf	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	26	300.00	7800.00	2026-04-10 00:13:13.744
2ffb288d-c3c1-4a6f-80e9-8b4f8b3e31c9	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	39	850.00	33150.00	2026-04-10 00:13:13.747
c4d83f69-718d-4ee0-9b6e-dabded147cac	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	45	300.00	13500.00	2026-04-10 00:13:13.75
90ad179d-0a8a-478e-a174-95a734bf2feb	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	41	700.00	28700.00	2026-04-10 00:13:13.752
3b4bf2e0-a0c6-4b36-81df-6eb02e19ad32	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	8	300.00	2400.00	2026-04-11 00:13:13.756
62f32f58-ab3f-4273-9ab6-0349a0e32a1d	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	9	650.00	5850.00	2026-04-12 00:13:13.759
d10e35f2-3066-45fe-9aa7-ccb6cc7062a6	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	22	300.00	6600.00	2026-04-13 00:13:13.762
c982fa2d-d581-4bc2-aa8d-4a598b70ef49	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	650.00	23400.00	2026-04-14 00:13:13.764
3c06dc77-7cbb-4d3b-a7f9-c0b4e2210b0c	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	40	300.00	12000.00	2026-04-14 00:13:13.767
a7378091-d232-4bf7-941a-a3320a457fab	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	44	850.00	37400.00	2026-04-15 00:13:13.769
b317d042-e5ee-4c3f-a2de-635e1b196f5b	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	23	700.00	16100.00	2026-04-15 00:13:13.772
00d608f8-04ec-4d34-89f7-d733d71c3f43	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	39	850.00	33150.00	2026-04-15 00:13:13.774
2bd603cf-eb5f-4d37-881d-ac25d7d8b547	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	7	450.00	3150.00	2026-04-15 00:13:13.776
21404dfe-5c00-4d8a-bae0-1cd9a62a7ccc	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	48	300.00	14400.00	2026-04-16 00:13:13.779
dcd09b75-5478-47a2-9b1c-b91146529826	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	32	700.00	22400.00	2026-04-16 00:13:13.781
b742ff52-5ce3-42f8-9a4b-655fb15e1294	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	12	650.00	7800.00	2026-04-16 00:13:13.783
014614e3-45f8-4590-9b71-1e6f2dbf3747	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	6	300.00	1800.00	2026-04-17 00:13:13.786
fdac1f61-f8f7-4aa4-b47b-acc0a5fc95a2	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	26	300.00	7800.00	2026-04-17 00:13:13.788
68880200-f7ae-49c7-a669-aa2fa6d27e9e	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	33	850.00	28050.00	2026-04-17 00:13:13.79
64b034ac-d4d8-4614-bd64-63146194021c	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	24	300.00	7200.00	2026-04-17 00:13:13.792
e8553850-687e-4a09-ba04-6c28315f743e	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	14	300.00	4200.00	2026-04-18 00:13:13.795
f995b9bb-777b-4579-a221-b7ce36beec1b	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	24	300.00	7200.00	2026-04-18 00:13:13.797
ad967f9b-04aa-4529-b27b-4fc45c12f34d	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	30	700.00	21000.00	2026-04-18 00:13:13.799
c4cd8c2f-e0a8-47cf-af5b-c9aaaa297ece	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	41	700.00	28700.00	2026-04-18 00:13:13.802
de3fa10b-c460-45d9-9f58-cb323510e95e	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	30	700.00	21000.00	2026-04-19 00:13:13.804
5fa7ca51-e8ae-4c10-aa76-aa38978bb9f3	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	47	700.00	32900.00	2026-04-19 00:13:13.807
46017a53-913a-4d73-b5eb-ec4608ee0691	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	8	850.00	6800.00	2026-04-19 00:13:13.81
bd1269da-85c0-45c1-90da-72d22a3dab7d	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	28	650.00	18200.00	2026-04-20 00:13:13.813
5905c893-8a54-4519-8b29-ef6dddacbd21	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	11	450.00	4950.00	2026-04-20 00:13:13.816
ae2d3d7c-7881-4517-bf6d-42dba527a1e1	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	46	700.00	32200.00	2026-04-20 00:13:13.818
81670f08-d64d-4105-bc36-054f8f89c42b	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	35	850.00	29750.00	2026-04-21 00:13:13.821
3c4e1f11-4e43-4f13-ab78-94ef3e6bdc10	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	11	450.00	4950.00	2026-04-21 00:13:13.825
884d589b-3528-4a9f-919a-bec21ff7e2b1	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	25	650.00	16250.00	2026-04-22 00:13:13.828
cc3f8d1c-f7de-41be-bf51-ce494856a9c1	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	19	850.00	16150.00	2026-04-22 00:13:13.83
e1109cb5-ffb1-4e87-8a06-7e0779af28d6	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	23	300.00	6900.00	2026-04-22 00:13:13.833
9e534895-5e9c-4be8-9f91-a3caa0b9a94d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	38	300.00	11400.00	2026-04-22 00:13:13.835
2eb3e9cc-00ec-4be4-937f-39fc09377dad	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	26	700.00	18200.00	2026-04-23 00:13:13.837
674e6039-d518-4bb2-855c-d00acd8bb572	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	37	450.00	16650.00	2026-04-23 00:13:13.839
4c8f482b-7ddb-4141-af97-a5f444af342d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	7	300.00	2100.00	2026-04-24 00:13:13.842
19fe8c89-e5dd-42c3-a238-38e2b3b9061a	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	44	650.00	28600.00	2026-04-24 00:13:13.845
85bf4abf-1654-4cd3-926f-da412f75e2af	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	6	700.00	4200.00	2026-04-24 00:13:13.848
89ed4228-7f4b-40aa-9e3b-2b059a432b40	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	38	700.00	26600.00	2026-04-24 00:13:13.85
8fa6ff56-041f-4721-9dc4-1d410c050e7d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	41	300.00	12300.00	2026-04-25 00:13:13.852
aa56baeb-eca9-43d1-80b6-ed9ca4a71607	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	25	650.00	16250.00	2026-04-25 00:13:13.854
dba4bfba-0575-42cc-a477-246ba14226c2	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	40	850.00	34000.00	2026-04-26 00:13:13.857
a4a7b926-85af-4440-bb9a-e4c92e334511	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	10	850.00	8500.00	2026-04-26 00:13:13.859
1d6f1ba5-b5ca-4f4c-b710-4a0cdffa72c4	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	43	300.00	12900.00	2026-04-26 00:13:13.863
5287a200-50fd-42a6-9e27-5a0756c8f855	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	19	450.00	8550.00	2026-04-26 00:13:13.866
8b526c02-2b11-41c2-868f-506fbb9a1e35	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	7	700.00	4900.00	2026-04-27 00:13:13.868
3ba17298-6149-487d-ab87-0b2129ee54ae	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	12	700.00	8400.00	2026-04-27 00:13:13.87
d41318c7-86cf-403c-b53d-a2994aeb8bef	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	20	700.00	14000.00	2026-04-28 00:13:13.872
d6d46259-cbfd-4527-b415-7f51ad041ce7	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	29	700.00	20300.00	2026-04-28 00:13:13.875
1b14a55b-e686-4f34-891d-cacdb6698024	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	700.00	25200.00	2026-04-29 00:13:13.877
4c1d1a89-3800-4c1c-a6e7-4310c7b3b0e0	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	11	650.00	7150.00	2026-04-29 00:13:13.88
e82b63b1-574d-465d-bb9b-635288bc86a3	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	16	850.00	13600.00	2026-04-29 00:13:13.882
d4fb7a11-221a-4862-901c-2c0a9c489fce	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	37	450.00	16650.00	2026-04-30 00:13:13.884
449e9a02-a447-4d62-9582-d7e8c81755fc	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	25	650.00	16250.00	2026-04-30 00:13:13.886
8442b72a-a102-406d-a0dd-2c9fcf8967da	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	9	700.00	6300.00	2026-04-30 00:13:13.888
454b04ee-5248-40c7-8297-8f9ba4f54be9	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	12	850.00	10200.00	2026-04-30 00:13:13.89
2ee3c984-ac16-410c-bb63-7bdf565b1601	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	36	450.00	16200.00	2026-05-01 00:13:13.893
dde9b1ce-4a02-449a-94fa-8dd295fae11c	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	36	300.00	10800.00	2026-05-01 00:13:13.896
3dc3d935-5be9-4818-8302-448d0f5b0fde	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	41	650.00	26650.00	2026-05-01 00:13:13.898
5932cf33-d02c-4f2e-8d29-62531d70d526	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	11	300.00	3300.00	2026-05-01 00:13:13.9
0055201c-8a2b-4f74-b486-70aa7952d396	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	46	850.00	39100.00	2026-05-02 00:13:13.902
f11c2700-9f36-4217-be38-c8f205adfe15	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	43	650.00	27950.00	2026-05-02 00:13:13.903
b02cc9cc-0eec-4863-b030-790afe4c00a7	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	19	300.00	5700.00	2026-05-02 00:13:13.905
9a2a3cb9-2205-4b56-a07a-c75fcdab1211	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	29	850.00	24650.00	2026-05-03 00:13:13.909
08370cdb-8456-46a1-9da3-9d1f07a6c385	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	23	450.00	10350.00	2026-05-03 00:13:13.912
6e0932e2-1f91-4b04-bf01-73e718468423	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	41	650.00	26650.00	2026-05-03 00:13:13.915
a7794261-cef2-41bf-b9c9-58e3989e2f28	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	6	650.00	3900.00	2026-05-04 00:13:13.917
2df8fd56-5676-4f91-b987-904530807465	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	46	450.00	20700.00	2026-05-04 00:13:13.919
07f5843a-53cb-46a2-8bf4-22b36e6531fe	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	37	300.00	11100.00	2026-05-04 00:13:13.921
e72f45d2-5124-42c9-a519-e478c654b765	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	24	300.00	7200.00	2026-05-05 00:13:13.924
0a076fbf-5d0a-4566-a61a-6de41c16f6f8	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	11	850.00	9350.00	2026-05-05 00:13:13.927
61fb2ac5-4c44-4f95-a96f-21d060886d5b	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	17	850.00	14450.00	2026-05-05 00:13:13.929
78834208-c56c-4895-80dc-dc77fcffcae4	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	15	850.00	12750.00	2026-05-05 00:13:13.931
91eafdc6-057d-4beb-9503-c9b2756aef48	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	42	300.00	12600.00	2026-05-06 00:13:13.933
9666a715-41de-46b2-a319-1d47eaab52d0	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	11	650.00	7150.00	2026-05-06 00:13:13.934
d2143c41-10c8-4ac8-ab02-c4551e93d20c	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	38	450.00	17100.00	2026-05-07 00:13:13.937
7be9242d-155c-41ca-a054-38757acaea01	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	40	300.00	12000.00	2026-05-07 00:13:13.939
f6f83584-d609-4ae7-8afd-c5c9a51e40ec	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	12	850.00	10200.00	2026-05-07 00:13:13.943
c8216c7c-e1bf-4881-88bb-51589db191d6	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	22	650.00	14300.00	2026-05-08 00:13:13.946
03c7cc83-8a7f-4bd0-8f8b-95ded42eeffb	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	46	700.00	32200.00	2026-05-08 00:13:13.948
06c3d9b9-2c15-486d-8df3-91e91f0da510	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	45	850.00	38250.00	2026-05-08 00:13:13.95
e6f4d907-f78d-41a4-aa2b-feda68ad9376	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	22	650.00	14300.00	2026-05-09 00:13:13.952
226c7a87-5586-49eb-b9b1-fc540a9784fd	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	27	650.00	17550.00	2026-05-09 00:13:13.954
d55df9f6-a8c4-477a-b34e-46b9d34aef72	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	43	300.00	12900.00	2026-05-10 00:13:13.957
9e0532a1-17c4-4642-86fe-7dc50bb0f85c	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	27	450.00	12150.00	2026-05-10 00:13:13.96
a63568e8-5553-4651-a338-af4ccca463b0	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	21	650.00	13650.00	2026-05-11 00:13:13.963
5661d1ee-443f-434f-b007-81956ed4d0c9	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	35	300.00	10500.00	2026-05-12 00:13:13.965
54be88ee-a31c-4124-9eeb-823aa8689922	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	21	700.00	14700.00	2026-05-12 00:13:13.968
ee761e64-0724-40f1-abc4-b9c6704a7d55	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	34	300.00	10200.00	2026-05-12 00:13:13.97
ea8d5579-bbd5-4e27-b956-7fefd45bcc3c	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	23	300.00	6900.00	2026-05-12 00:13:13.972
298a68fe-bd5a-4f2c-ab47-38a03dccbd40	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	44	700.00	30800.00	2026-05-13 00:13:13.975
762a4a23-54c3-4e41-94ca-9f3b092d8737	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	13	650.00	8450.00	2026-05-14 00:13:13.977
2d57c8dc-5526-41ee-8d70-4b6caf826020	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	26	700.00	18200.00	2026-05-14 00:13:13.979
426d43bb-1855-44a4-a815-e0164a3b0b8f	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	22	650.00	14300.00	2026-05-15 00:13:13.981
9394aaf8-079a-496e-8911-436af89fadab	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	26	300.00	7800.00	2026-05-16 00:13:13.983
6f117ebf-dbfc-4a59-8d5e-78108253e58f	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	31	700.00	21700.00	2026-05-16 00:13:13.985
ff830a8e-f8ce-435e-a908-b71fc35bef31	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	40	300.00	12000.00	2026-05-17 00:13:13.987
c2f478aa-1db7-4eb5-b0d0-921687efe097	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	9	300.00	2700.00	2026-05-17 00:13:13.989
fc21bfdf-7845-4a81-ac6a-b9b0829e4896	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	6	700.00	4200.00	2026-05-17 00:13:13.993
2a2e1dfb-45f3-4b60-afdd-7afd8f66386d	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	30	450.00	13500.00	2026-05-18 00:13:13.996
c22ce4e4-2292-4fc4-bada-b30d67e0ce2f	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	6	650.00	3900.00	2026-05-18 00:13:13.998
39317482-a512-41b3-9518-e732822ac356	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	34	450.00	15300.00	2026-05-18 00:13:14
aff87ab1-415e-490e-b098-60afc24a32b8	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	10	850.00	8500.00	2026-05-19 00:13:14.003
4bec7b7a-826e-4943-9420-8bd69c43ba91	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	40	300.00	12000.00	2026-05-19 00:13:14.005
f97931b1-b7f9-40c8-8ea7-95907b14f2e3	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	21	700.00	14700.00	2026-05-19 00:13:14.009
daebdf14-eac0-44df-b7d2-936cc2bc68e6	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	9	650.00	5850.00	2026-05-19 00:13:14.011
a9b63623-c39b-4b01-a9bd-ab0528b2aadb	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	42	850.00	35700.00	2026-05-20 00:13:14.014
036a0935-edc2-4bbb-89a9-ace8fe0cd338	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	46	700.00	32200.00	2026-05-21 00:13:14.017
652c0b0a-f494-4030-b95a-eafd28638c9d	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	28	450.00	12600.00	2026-05-22 00:13:14.019
f244972d-595c-4813-8f19-71622bbe2898	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	19	650.00	12350.00	2026-05-22 00:13:14.021
0c1d00e7-a4ca-4656-b16b-b039152868ff	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	48	300.00	14400.00	2026-05-22 00:13:14.024
d5def58a-fc8d-4e4e-a108-af43fbc48912	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	25	850.00	21250.00	2026-05-22 00:13:14.026
fc1ff79f-059f-4e55-b94c-9258bd4385de	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	34	650.00	22100.00	2026-05-23 00:13:14.028
1e12aa50-4f2b-4a3e-842f-9019c2000993	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	43	650.00	27950.00	2026-05-23 00:13:14.03
56763053-7dca-40df-aadb-656ad229bfa4	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	18	300.00	5400.00	2026-05-23 00:13:14.033
0acc1c52-eb27-46f8-81b1-ac2e79250407	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	43	650.00	27950.00	2026-05-24 00:13:14.036
623a6b9d-b284-4759-bcb7-dd11877754d2	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	23	650.00	14950.00	2026-05-24 00:13:14.038
fba3d52c-acd2-40e4-9b00-a79fd19af1c2	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	32	650.00	20800.00	2026-05-25 00:13:14.04
73631d31-6b67-448a-9151-0e6a33d6d858	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	19	700.00	13300.00	2026-05-25 00:13:14.042
0f87d0a8-a5c3-4d0b-8fec-43a5663ea20c	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	650.00	23400.00	2026-05-25 00:13:14.045
0df95889-eca3-4adc-80a3-8ac497f05486	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	39	300.00	11700.00	2026-05-25 00:13:14.047
8530b8c4-e8d4-4678-850c-f38856c8df15	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	11	300.00	3300.00	2026-05-26 00:13:14.049
df82164a-8669-44f0-8563-2f6bbc5eedf4	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	700.00	12600.00	2026-05-27 00:13:14.052
060178e8-8d19-4265-84e8-d381bb5657a3	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	27	450.00	12150.00	2026-05-27 00:13:14.054
de8613ed-d549-43c2-9dad-f484be244d9a	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	28	650.00	18200.00	2026-05-27 00:13:14.057
845f64a1-0cc6-4880-b6e1-d4f534c37246	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	23	700.00	16100.00	2026-05-27 00:13:14.06
176a4ab2-fd42-4e8d-b9e0-175591d0de12	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	15	450.00	6750.00	2026-05-28 00:13:14.062
5941122f-db21-4fc8-9186-c005f46e58e3	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	26	650.00	16900.00	2026-05-29 00:13:14.065
cac088e5-e964-4f8a-b6e6-9aa4a36b2d1e	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	19	850.00	16150.00	2026-05-29 00:13:14.067
9d4d7147-144e-470d-8a51-f35fea859bb9	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	14	700.00	9800.00	2026-05-29 00:13:14.07
e006c6a2-cbc8-424c-8f96-337413df92ea	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	47	700.00	32900.00	2026-05-30 00:13:14.073
1f723b6a-e63c-4b04-920f-9d79f0293df1	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	23	700.00	16100.00	2026-05-30 00:13:14.075
128370c2-6d38-4f95-8fb8-2612548d1e53	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	48	450.00	21600.00	2026-05-30 00:13:14.078
62461aa5-67c8-4621-9a2b-4fd540f986ec	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	10	650.00	6500.00	2026-05-30 00:13:14.08
d56bf86d-d539-4f3f-852d-407eb9af1c45	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	25	450.00	11250.00	2026-05-31 00:13:14.083
9386c5df-da92-4655-a9ed-c2ca459ddd26	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	14	300.00	4200.00	2026-05-31 00:13:14.085
929175c1-18f1-4f89-8918-a45625994fb6	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	20	650.00	13000.00	2026-05-31 00:13:14.087
1909d91f-50ca-429d-947a-06a9f9083308	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	32	450.00	14400.00	2026-05-31 00:13:14.09
8c38f15c-12b5-422b-9a3b-ff71364b5af2	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	11	650.00	7150.00	2026-06-01 00:13:14.093
d50853a1-4a66-4042-b87a-bbb2a0a4f1f0	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	21	700.00	14700.00	2026-06-01 00:13:14.096
ea6e3071-e96b-47fb-a1db-a67c41255633	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	38	650.00	24700.00	2026-06-01 00:13:14.099
ce1d3e5c-f642-4dd0-b919-1ee140874a4b	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	24	700.00	16800.00	2026-06-02 00:13:14.101
57b3741f-11e9-47b4-ba1f-47a049092db2	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	8	850.00	6800.00	2026-06-02 00:13:14.103
1970e59f-e302-4222-ae37-e4cb6c1636df	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	43	700.00	30100.00	2026-06-02 00:13:14.107
e93b3c3e-fe9e-4f5e-b1fa-950e5ce0f3e3	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	34	700.00	23800.00	2026-06-03 00:13:14.109
a64da1dd-2783-4509-bc3b-0f642abaeafb	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	20	300.00	6000.00	2026-06-03 00:13:14.112
f5b01b54-4181-4cbf-84ec-c290b9f13eaf	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	37	850.00	31450.00	2026-06-03 00:13:14.115
9580abc7-5ed9-4016-a3a2-04376974dff2	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	44	850.00	37400.00	2026-06-03 00:13:14.117
5cb0768e-98d5-47ee-82be-0d0d88f33c5a	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	15	700.00	10500.00	2026-06-04 00:13:14.119
c053874c-2690-41ee-ad5f-90216a6b311b	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	30	850.00	25500.00	2026-06-04 00:13:14.123
8efd814a-e485-482c-8810-6dea980909a9	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	17	650.00	11050.00	2026-06-04 00:13:14.126
38d7cb14-d1c7-43b4-b555-4b787f11ca7e	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	18	300.00	5400.00	2026-06-04 00:13:14.129
89cdd7c5-fa25-4e04-8027-11d720bb091c	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	34	300.00	10200.00	2026-06-05 00:13:14.131
3dceb936-c1ac-4246-a38c-822a3298c357	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	47	700.00	32900.00	2026-06-06 00:13:14.133
39de5a0e-9572-4dfe-a3bc-f93db96c2737	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	9	650.00	5850.00	2026-06-06 00:13:14.137
275939a6-6864-46a1-ab9e-1631912adcfb	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	39	300.00	11700.00	2026-06-07 00:13:14.14
f071a116-8e9a-4c59-a492-b34dfda86f5d	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	650.00	11700.00	2026-06-07 00:13:14.142
22e0ca0c-f87e-4c96-b6c8-2d7783dc6ae1	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	19	300.00	5700.00	2026-06-08 00:13:14.145
12eb4663-5e76-489a-bdf2-7c2e0b5a153c	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	23	700.00	16100.00	2026-06-08 00:13:14.148
bdb7b01c-51c4-465b-b34c-7296aa0b930e	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	700.00	25200.00	2026-06-08 00:13:14.151
ab41a6b6-f959-4c48-81b6-f3a6d1256349	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	14	850.00	11900.00	2026-06-09 00:13:14.154
4d48b224-5f6e-44e4-be79-4c723cd35fe8	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	6	650.00	3900.00	2026-06-09 00:13:14.159
edadd330-b1fa-4535-aa78-7f8f5be54212	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	24	300.00	7200.00	2026-06-10 00:13:14.163
dd164ab5-7dec-48e3-9bb6-5be62ce5e454	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	42	450.00	18900.00	2026-06-10 00:13:14.166
5d9dd46d-33f5-4b6f-85f8-a1df64be1f43	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	40	450.00	18000.00	2026-06-10 00:13:14.169
ab9f1e7e-6eef-4094-9bed-11c5f36d9e8a	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	29	650.00	18850.00	2026-06-10 00:13:14.172
5552b065-06f1-4433-88c6-cea972bcad05	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	8	850.00	6800.00	2026-06-11 00:13:14.176
c93dbf49-0940-411a-9fbe-5f7d7cd5a605	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	39	300.00	11700.00	2026-06-12 00:13:14.179
27446ecd-f5e2-42e3-8753-f83fd22c1124	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	46	700.00	32200.00	2026-06-12 00:13:14.183
779803fa-77e4-40e5-aeff-2d631b4f823c	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	30	450.00	13500.00	2026-06-12 00:13:14.185
a5c189d9-d0e4-40a7-8f1e-a2bbff1d7716	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	22	300.00	6600.00	2026-06-12 00:13:14.188
bb53f18d-3ba3-499b-b5ba-369df44a37f0	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	11	700.00	7700.00	2026-06-13 00:13:14.191
e515889c-9156-4016-9445-cf7cb44b7163	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	45	650.00	29250.00	2026-06-13 00:13:14.194
fb374a43-0a9a-4e75-bb5c-64109e9cb36b	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	9	850.00	7650.00	2026-06-14 00:13:14.197
c2e9c2a4-30fe-4605-9403-937a896c84d5	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	7	850.00	5950.00	2026-06-14 00:13:14.2
363843ec-66ff-4f19-9c77-fda820db487a	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	29	850.00	24650.00	2026-06-14 00:13:14.203
dcfc7c1d-f9dd-4a2f-9e8e-1d84e8c21a6e	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	11	300.00	3300.00	2026-06-14 00:13:14.207
e6d731af-c678-40e4-bfb6-24a8182028ce	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	40	850.00	34000.00	2026-06-15 00:13:14.209
906524ae-d6e7-4f57-a5b8-f3a69629f412	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	14	450.00	6300.00	2026-06-15 00:13:14.212
02b01901-0d99-4ce8-90df-43afe0efdf87	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	44	300.00	13200.00	2026-06-15 00:13:14.214
0d7baddd-65d8-4703-a93a-d6af0bafceea	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	43	700.00	30100.00	2026-06-16 00:13:14.217
12183475-395d-41de-b718-67d70a02a35e	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	44	650.00	28600.00	2026-06-17 00:13:14.22
50a6e504-3d8e-4a67-aeda-f11210de0c0f	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	39	650.00	25350.00	2026-06-17 00:13:14.223
838b7783-3160-43e2-b785-04fdfaa2b563	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	42	700.00	29400.00	2026-06-17 00:13:14.225
6cec6f10-0ef5-4af7-a6df-6cc5e2394760	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	8	450.00	3600.00	2026-06-17 00:13:14.228
3019a48f-0faa-4fa2-8ee3-6f44246e5145	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	25	850.00	21250.00	2026-06-18 00:13:14.23
4eebef9c-045b-40f3-a9c8-1e6f9ca58a6f	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	17	450.00	7650.00	2026-06-18 00:13:14.232
4f9ec790-632c-4670-974e-26f6fec95e56	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	47	700.00	32900.00	2026-06-18 00:13:14.235
a2c96670-dc67-42d6-9b8c-50b4d77c3523	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	15	650.00	9750.00	2026-06-19 00:13:14.237
506ff38b-82b6-4cd2-baa3-5ec818f5ae46	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	44	450.00	19800.00	2026-06-20 00:13:14.24
a612af5e-9b03-42f5-b919-6dbfc1c8bc94	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	12	300.00	3600.00	2026-06-21 00:13:14.242
d4cf908a-d1b7-48d1-985e-409b60012309	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	36	450.00	16200.00	2026-06-22 00:13:14.245
f5191598-d86e-4088-b690-3793ffc7861b	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	24	450.00	10800.00	2026-06-22 00:13:14.249
644b55e2-d4dc-465d-a0ca-dbcc9200ed80	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	40	300.00	12000.00	2026-06-22 00:13:14.251
ad4c3d13-6b86-41a6-9b8b-6d85f01dd542	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	14	300.00	4200.00	2026-06-22 00:13:14.254
55ec8de7-614e-4c76-b65e-64eff87329b4	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	15	850.00	12750.00	2026-06-23 00:13:14.257
32dfeca1-efdf-4f63-bf75-e8614f0e07bc	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	32	700.00	22400.00	2026-06-24 00:13:14.259
7c406076-6633-4a8a-a3a0-ded761b696b3	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	37	700.00	25900.00	2026-06-24 00:13:14.262
c2dda9f9-b458-448e-90d0-90a7c8472e6a	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	32	850.00	27200.00	2026-06-25 00:13:14.265
9af3d8e0-db5a-4c9b-a5e1-e551f5c7f0da	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	20	650.00	13000.00	2026-06-25 00:13:14.267
0ff6c31d-d045-4c90-a060-8e6727922b88	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	47	650.00	30550.00	2026-06-25 00:13:14.269
0ec81f47-e634-41a3-bbe2-912529c865f1	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	27	650.00	17550.00	2026-06-26 00:13:14.271
9a879e8b-326b-4665-b995-a8d8f9b17753	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	23	700.00	16100.00	2026-06-26 00:13:14.274
518bdede-3cf1-42a3-9736-fd3442cfbed8	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	6	650.00	3900.00	2026-06-26 00:13:14.277
993146b1-5c9e-42de-a972-fd060b43f872	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	27	700.00	18900.00	2026-06-27 00:13:14.28
e3885a73-0c21-43ca-b1e7-b376e8dbcf75	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	38	450.00	17100.00	2026-06-27 00:13:14.282
e22d4b6d-9f0c-459f-9327-3434380b8760	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	12	450.00	5400.00	2026-06-27 00:13:14.284
1b247a87-8ce9-4cda-8be7-22825dbd9e6d	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	6	700.00	4200.00	2026-06-27 00:13:14.287
0171141b-1530-439c-8f6b-d0f003ff1c7a	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	48	850.00	40800.00	2026-06-28 00:13:14.29
fde95cc5-0fd1-4e0f-8bdd-bba96f37fe67	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	26	300.00	7800.00	2026-06-28 00:13:14.292
361c7622-2d1d-41d7-ac4a-8fd153815d38	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	22	300.00	6600.00	2026-06-29 00:13:14.295
81c84c25-6095-4af4-997f-b030b955c41c	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	42	700.00	29400.00	2026-06-29 00:13:14.298
f3b5273e-e3f7-465f-85b5-a812bcf36562	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	7	300.00	2100.00	2026-06-29 00:13:14.3
527469d0-799a-48c2-ad6d-29d44cd14b73	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	15	850.00	12750.00	2026-06-29 00:13:14.303
cf6a1241-4003-4280-a103-ae0855394c88	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	42	650.00	27300.00	2026-06-30 00:13:14.306
584c43d0-57d9-4cf2-8cf9-19dafa23f59d	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	42	450.00	18900.00	2026-06-30 00:13:14.309
47945eae-182e-40c4-8a84-dd453168869b	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	35	850.00	29750.00	2026-06-30 00:13:14.311
c381d163-5ccf-485e-af99-f5533c0a9da2	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	35	300.00	10500.00	2026-06-30 00:13:14.314
03244f85-7a1e-4001-bf5b-17c9b1f9cc98	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	26	650.00	16900.00	2026-07-01 00:13:14.316
71ccb4bd-42bf-46db-9adb-010fa17e424b	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	7	850.00	5950.00	2026-07-02 00:13:14.318
a986c324-8a65-4b36-9986-fcf4be84dd63	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	32	700.00	22400.00	2026-07-02 00:13:14.32
87b21e24-929d-4ba6-83d9-03d8896094d3	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	6	850.00	5100.00	2026-07-02 00:13:14.324
4ea0ad9e-8274-4a5d-8666-94ad78225b8c	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	9	650.00	5850.00	2026-07-02 00:13:14.326
9ba8ce85-692e-4334-a994-0bb32d48ff93	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	37	300.00	11100.00	2026-07-03 00:13:14.329
6989545b-56fd-4cea-960d-01a28ecbbdc3	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	20	850.00	17000.00	2026-07-04 00:13:14.331
4a105d35-0c76-49e0-b53f-7f5e049064ff	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	34	700.00	23800.00	2026-07-04 00:13:14.333
c7246235-3bcd-4e0f-94f0-6b81be7fea51	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	15	450.00	6750.00	2026-07-04 00:13:14.335
ce9273e4-2555-4a3c-94c6-983e4152f50e	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	20	450.00	9000.00	2026-07-04 00:13:14.337
f5cb79bc-74d1-4190-8e7a-84b21b0d3407	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	35	450.00	15750.00	2026-07-05 00:13:14.339
47dcbff6-c281-45bb-9ae6-f5c4f466d056	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	12	700.00	8400.00	2026-07-05 00:13:14.342
a3c640a5-af6d-47e9-956c-e2b0c23e6e0d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	32	300.00	9600.00	2026-07-05 00:13:14.344
d597af48-1e68-4159-8fba-8bafccc1200c	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	6	850.00	5100.00	2026-07-05 00:13:14.346
6119043b-8825-400e-a297-ea6daa9449db	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	450.00	16200.00	2026-07-06 00:13:14.348
d5c5eaaa-bd26-445b-b3af-094ba52cf699	19f142ee-8581-4d0b-be95-e276eff686f4	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	35	700.00	24500.00	2026-07-06 00:13:14.35
aac897f4-591d-447b-bfa9-62a3be90ce0d	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	32	850.00	27200.00	2026-07-06 00:13:14.352
dd5de3bf-ddb7-492b-a982-444971848212	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	18	850.00	15300.00	2026-07-06 00:13:14.354
ed50d22c-062c-4bca-8b21-e89f2d59468a	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	33	300.00	9900.00	2026-07-07 00:13:14.356
1cc36a4a-e53d-4e87-92ee-202f8c0a6a11	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	48	850.00	40800.00	2026-07-07 00:13:14.359
36f78713-c52c-4c13-86fb-7a60817e465a	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	34	650.00	22100.00	2026-07-07 00:13:14.362
325dde2a-4802-42c3-8f1a-e195ce2b3c03	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	c1fb8271-5c37-4167-9278-2bfbc681d001	6	300.00	1800.00	2026-07-08 00:13:14.364
2695acb3-9d01-4c4d-bb2a-054a2d7a86a9	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	7	700.00	4900.00	2026-07-08 00:13:14.366
c99404dd-2b2b-4eeb-8727-95ceb00c1e79	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	33	850.00	28050.00	2026-07-08 00:13:14.369
0e3b467f-29bc-4da3-9ca2-d2db187f8f32	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	30	300.00	9000.00	2026-07-08 00:13:14.372
c29c9f9c-98ac-43e4-962c-a47eb9c9ebe4	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	37	650.00	24050.00	2026-07-09 00:13:14.375
55f4268f-03e6-406d-90c8-ef92895b15f6	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	0ac63569-7cfb-4168-b29f-3592fd3ab6d6	25	700.00	17500.00	2026-07-09 00:13:14.377
e9da4ec1-13ad-4c6c-a8d4-0ae45be28b2d	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	36	300.00	10800.00	2026-07-09 00:13:14.379
0377cca2-aed7-4ee7-a1b1-2fb1aef6d0c5	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	9	700.00	6300.00	2026-07-09 00:13:14.381
74366c37-0c62-4861-b2c4-6899dbe41388	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	31	300.00	9300.00	2026-07-10 00:13:14.383
d4cfe4a0-1450-4805-b62b-de190a675cf2	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	5	650.00	3250.00	2026-07-11 01:08:47.912249
95d9a81f-a194-4486-8f3a-ea3cf9495119	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	5	650.00	3250.00	2026-07-11 01:14:06.361986
67ef7ca1-be87-4a15-acdc-5553c6f47df9	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	12	650.00	7800.00	2026-07-11 01:15:42.380217
e57e6e49-5508-47c3-96b5-778545b5dfa0	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	5	650.00	3250.00	2026-07-11 01:15:59.159135
6c9e64c8-6977-46e0-b3af-1409cceacfe9	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	e39e99d4-1b37-45b4-8bce-b01fe80af6a3	5	650.00	3250.00	2026-07-11 01:16:11.834394
\.


--
-- Data for Name: stocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stocks (id, product_id, depot_id, quantity, last_updated) FROM stdin;
b7095762-a7b9-4332-b2b4-89c6f26111ed	2489a5f4-026c-4e98-824e-b33e07fb1ba3	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	300	2026-07-11 00:13:13.067048
84f0159e-3ed0-4cd0-948b-d3b2b9aeee2f	e6455bda-57fe-42ed-9c34-af24d99011d1	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	85	2026-07-11 00:13:13.067048
bc8d79f8-42e2-4449-9eda-c213a48fc2fa	19f142ee-8581-4d0b-be95-e276eff686f4	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	95	2026-07-11 00:13:13.067048
5353c02b-4546-4e5a-a4bb-7826da0b1c53	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	60	2026-07-11 00:13:13.067048
362c634e-5394-4b00-b9df-e9b07b873d9e	8cca89c6-f11d-4843-94ca-3a62aa634b8b	8cecbc4a-6053-431b-b3db-c3f7f508df09	80	2026-07-11 00:13:13.067048
39f9ed17-719d-48c8-bd45-edc12d41a89a	2489a5f4-026c-4e98-824e-b33e07fb1ba3	8cecbc4a-6053-431b-b3db-c3f7f508df09	200	2026-07-11 00:13:13.067048
3d9c8ad8-8f3e-4991-98ca-3af940bd223c	e6455bda-57fe-42ed-9c34-af24d99011d1	8cecbc4a-6053-431b-b3db-c3f7f508df09	110	2026-07-11 00:13:13.067048
5f482ee5-dfe1-464f-814b-f78cbe26a7c5	19f142ee-8581-4d0b-be95-e276eff686f4	8cecbc4a-6053-431b-b3db-c3f7f508df09	70	2026-07-11 00:13:13.067048
ec706e3e-7ea5-42db-8181-b289ca63e4ae	44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0	8cecbc4a-6053-431b-b3db-c3f7f508df09	45	2026-07-11 00:13:13.067048
923722bf-42ac-4708-9158-636663ad1fc1	8cca89c6-f11d-4843-94ca-3a62aa634b8b	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	55	2026-07-11 00:13:13.067048
e469952d-3312-49f5-a25c-8cd8ce0beffb	2489a5f4-026c-4e98-824e-b33e07fb1ba3	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	150	2026-07-11 00:13:13.067048
d3fe4a6c-4ed3-430e-931f-ceae4980561c	e6455bda-57fe-42ed-9c34-af24d99011d1	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	30	2026-07-11 00:13:13.067048
6adc2b82-9bb5-4bce-a13e-4c3eb82371e6	8cca89c6-f11d-4843-94ca-3a62aa634b8b	9b3436a8-a13f-46e3-9607-6426fbdf52ae	25	2026-07-11 00:13:13.067048
324e9880-26ab-412c-a131-1f6acc237c41	2489a5f4-026c-4e98-824e-b33e07fb1ba3	9b3436a8-a13f-46e3-9607-6426fbdf52ae	90	2026-07-11 00:13:13.067048
bf97c861-df9e-40b9-bf5e-94f336fd74c7	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5be172f4-df83-4992-8127-4ce6eebd8bec	40	2026-07-11 00:13:13.067048
3cd64727-46cf-441c-a802-fcf8d44068ae	e6455bda-57fe-42ed-9c34-af24d99011d1	5be172f4-df83-4992-8127-4ce6eebd8bec	50	2026-07-11 00:13:13.067048
e9a0aeae-d468-4932-9a7b-a6b4eb6300c4	8cca89c6-f11d-4843-94ca-3a62aa634b8b	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	88	2026-07-11 01:16:11.834394
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, name, role, depot_id, is_active, created_at, updated_at) FROM stdin;
0ac63569-7cfb-4168-b29f-3592fd3ab6d6	depot2@zoma.com	$2a$10$.punHvh75EjbUcEdl7DnyuImpT2jQ2yHJd7Fx6.mztNPWw4Yh1T0q	Admin Dépôt Douala	admin_depot	8cecbc4a-6053-431b-b3db-c3f7f508df09	t	2026-07-09 21:30:57.123851	2026-07-09 21:30:57.123851
e7c34b8e-8c88-45af-8fe4-69afef38a28e	livreur@zoma.com	$2a$10$.punHvh75EjbUcEdl7DnyuImpT2jQ2yHJd7Fx6.mztNPWw4Yh1T0q	Livreur Mobile	livreur	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	t	2026-07-09 21:30:57.123851	2026-07-09 21:55:52.732207
e39e99d4-1b37-45b4-8bce-b01fe80af6a3	vendeur@zoma.com	$2a$10$.punHvh75EjbUcEdl7DnyuImpT2jQ2yHJd7Fx6.mztNPWw4Yh1T0q	Vendeur Principal	vendeur	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	t	2026-07-09 21:30:57.123851	2026-07-09 21:56:13.898039
0bdefad8-80fd-45ba-9f26-b5f762109f53	vendeur2@zoma.com	$2a$10$oPDD1Lz6k3Wtr7Ck2tEMzun2Dg8yoW1xCC8zmaMOyGvSTZWn5zITW	Vendeur Douala	vendeur	8cecbc4a-6053-431b-b3db-c3f7f508df09	t	2026-07-11 00:13:13.067048	2026-07-11 00:13:13.067048
0b869353-5294-46f7-bca7-38dac005c8b4	vendeur3@zoma.com	$2a$10$oPDD1Lz6k3Wtr7Ck2tEMzun2Dg8yoW1xCC8zmaMOyGvSTZWn5zITW	Vendeur Bafoussam	vendeur	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	t	2026-07-11 00:13:13.067048	2026-07-11 00:13:13.067048
e98d3398-016b-4dcc-8533-30bd37ebcb08	depot3@zoma.com	$2a$10$oPDD1Lz6k3Wtr7Ck2tEMzun2Dg8yoW1xCC8zmaMOyGvSTZWn5zITW	Admin Dépôt Bafoussam	admin_depot	cde1f5a5-9dbd-4366-9549-e0e1662a25e0	t	2026-07-11 00:13:13.067048	2026-07-11 00:13:13.067048
5ed2c580-6643-4164-99a6-fab1f4d653e4	depot4@zoma.com	$2a$10$oPDD1Lz6k3Wtr7Ck2tEMzun2Dg8yoW1xCC8zmaMOyGvSTZWn5zITW	Admin Dépôt Garoua	admin_depot	9b3436a8-a13f-46e3-9607-6426fbdf52ae	t	2026-07-11 00:13:13.067048	2026-07-11 00:13:13.067048
c1fb8271-5c37-4167-9278-2bfbc681d001	depot1@zoma.com	$2a$10$.punHvh75EjbUcEdl7DnyuImpT2jQ2yHJd7Fx6.mztNPWw4Yh1T0q	Admin Dépôt Yaoundé	admin_depot	5e60d8bc-fec0-48be-bcfd-e95550c3f67d	t	2026-07-09 21:30:57.123851	2026-07-11 00:46:38.581848
7fcbbd16-b5f4-47ce-9b91-39b8bbdb28db	admin@zoma.com	$2a$10$.punHvh75EjbUcEdl7DnyuImpT2jQ2yHJd7Fx6.mztNPWw4Yh1T0q	Admin Global	admin_global	\N	t	2026-07-09 21:30:57.123851	2026-07-11 13:56:29.34183
\.


--
-- Name: depots depots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depots
    ADD CONSTRAINT depots_pkey PRIMARY KEY (id);


--
-- Name: fournisseurs fournisseurs_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fournisseurs
    ADD CONSTRAINT fournisseurs_email_key UNIQUE (email);


--
-- Name: fournisseurs fournisseurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fournisseurs
    ADD CONSTRAINT fournisseurs_pkey PRIMARY KEY (id);


--
-- Name: livraison_items livraison_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livraison_items
    ADD CONSTRAINT livraison_items_pkey PRIMARY KEY (id);


--
-- Name: livraisons livraisons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livraisons
    ADD CONSTRAINT livraisons_pkey PRIMARY KEY (id);


--
-- Name: livreurs livreurs_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livreurs
    ADD CONSTRAINT livreurs_email_key UNIQUE (email);


--
-- Name: livreurs livreurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livreurs
    ADD CONSTRAINT livreurs_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stocks stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_pkey PRIMARY KEY (id);


--
-- Name: stocks stocks_product_id_depot_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_product_id_depot_id_key UNIQUE (product_id, depot_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_livraisons_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_livraisons_status ON public.livraisons USING btree (status);


--
-- Name: idx_sales_depot_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_depot_date ON public.sales USING btree (depot_id, created_at);


--
-- Name: idx_stocks_depot_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stocks_depot_product ON public.stocks USING btree (depot_id, product_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: livraison_items livraison_items_livraison_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livraison_items
    ADD CONSTRAINT livraison_items_livraison_id_fkey FOREIGN KEY (livraison_id) REFERENCES public.livraisons(id) ON DELETE CASCADE;


--
-- Name: livraison_items livraison_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livraison_items
    ADD CONSTRAINT livraison_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: livraisons livraisons_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livraisons
    ADD CONSTRAINT livraisons_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- Name: livraisons livraisons_fournisseur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livraisons
    ADD CONSTRAINT livraisons_fournisseur_id_fkey FOREIGN KEY (fournisseur_id) REFERENCES public.fournisseurs(id);


--
-- Name: livraisons livraisons_livreur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livraisons
    ADD CONSTRAINT livraisons_livreur_id_fkey FOREIGN KEY (livreur_id) REFERENCES public.livreurs(id);


--
-- Name: livreurs livreurs_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.livreurs
    ADD CONSTRAINT livreurs_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- Name: products products_fournisseur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_fournisseur_id_fkey FOREIGN KEY (fournisseur_id) REFERENCES public.fournisseurs(id);


--
-- Name: sales sales_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- Name: sales sales_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sales sales_vendeur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.users(id);


--
-- Name: stocks stocks_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- Name: stocks stocks_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: users users_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- PostgreSQL database dump complete
--

