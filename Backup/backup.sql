--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-08 23:31:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4966 (class 0 OID 34823)
-- Dependencies: 223
-- Data for Name: Categoria; Type: TABLE DATA; Schema: public; Owner: userpw
--

INSERT INTO public."Categoria" VALUES (1, 'Acción');
INSERT INTO public."Categoria" VALUES (2, 'Aventura');
INSERT INTO public."Categoria" VALUES (3, 'Deportes');
INSERT INTO public."Categoria" VALUES (4, 'RPG');
INSERT INTO public."Categoria" VALUES (5, 'Simulación');


--
-- TOC entry 4968 (class 0 OID 34830)
-- Dependencies: 225
-- Data for Name: Juego; Type: TABLE DATA; Schema: public; Owner: userpw
--

INSERT INTO public."Juego" VALUES (1, 'Grand Theft Auto VI ', 120.00, false, true, 2, 'https://youtu.be/VQRLujxTm3c', 'Jason y Lucia siempre han sabido que las cartas estaban en su contra, pero cuando un golpe que parecía fácil sale mal, se ven atrapados en el lado más oscuro del lugar más soleado de América.');
INSERT INTO public."Juego" VALUES (2, 'Minecraft', 100.00, false, true, 2, 'https://youtu.be/r6Ja2ZxWbRE', '¡Explora tus propios mundos únicos, sobrevive a la noche y crea todo lo que puedas imaginar!');
INSERT INTO public."Juego" VALUES (3, 'Call of Duty', 80.00, false, true, 1, 'https://youtu.be/uUo5gnaYB_w', 'Squad up with friends or play solo in a thrilling and innovative Co-op Campaign, harness near-future weaponry in a signature Multiplayer experience packed with brand-new maps.');
INSERT INTO public."Juego" VALUES (4, 'Dota 2', 1.00, false, true, 1, 'https://youtu.be/DXBpMy9VgNU', 'Dota es el juego de estrategia en tiempo real de acción multijugador más profundo jamás creado que siempre tiene una nueva estrategia o táctica que descubrir. Jugar Dota es gratis y siempre lo será. Comienza ya a defender tu Ancestro.');
INSERT INTO public."Juego" VALUES (5, 'League of Legends', 1.00, false, true, 1, 'https://youtu.be/vzHrjOMfHPY', 'Los reinos convergen en el Paso de Koeshin. Revivid mitos ancestrales y jugad a ARAM como nunca.');


--
-- TOC entry 4962 (class 0 OID 34806)
-- Dependencies: 219
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: userpw
--

INSERT INTO public."Usuario" VALUES (2, '20223371@aloe.ulima.edu.pe', '$2b$10$ikvrz3EhVT78T8bwU9QCFOwP5RP7dhF0yc5cXdhZVcdNiQocXc5AW', 'trabajo123', '', true, 'USER');
INSERT INTO public."Usuario" VALUES (1, 'luisescobar.lfel@gmail.com', '$2b$10$ucbQ.VXQjrX0F6OR7SYrMunbziX298P3WFgNgMIxXPbklyxuwcNkO', 'ishpe7272', '', true, 'USER');
INSERT INTO public."Usuario" VALUES (3, '20214774@aloe.ulima.edu.pe', '$2b$10$fuVZkT1/4/KyvdRQBy8CROk03OjEd7l9zjNZh3mROylSfK7ov/dWO', '20214774', '', true, 'USER');
INSERT INTO public."Usuario" VALUES (4, '202147744@aloe.ulima.edu.pe', '$2b$10$VOQx6xnkzQj5AY65lJw4c.3riyAlXYbzxtALENyOghNQNQ7SIIqJG', '202147744', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoiMWY0NDgwIiwiZXhwaXJhdGlvbiI6MTc1MTYwNTA1MDk2MywiaWF0IjoxNzUxNjAxNDUwLCJleHAiOjE3NTE2MDUwNTB9.C5RdzqOoGIJ3MXW90WjZtqzQLnKWyGwovayyoP-q4Ks', false, 'USER');


--
-- TOC entry 4976 (class 0 OID 34862)
-- Dependencies: 233
-- Data for Name: Calificacion; Type: TABLE DATA; Schema: public; Owner: userpw
--



--
-- TOC entry 4970 (class 0 OID 34837)
-- Dependencies: 227
-- Data for Name: Imagen; Type: TABLE DATA; Schema: public; Owner: userpw
--

INSERT INTO public."Imagen" VALUES (1, 1, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751432928/juegos/f03157f4b6fdaf63468d85190f28dde6_yfqcqf.jpg', '1');
INSERT INTO public."Imagen" VALUES (2, 1, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751432933/juegos/53dfd82d3c264011dd4fdb0a64f10ecf_cefc6b.jpg', '2');
INSERT INTO public."Imagen" VALUES (4, 2, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433352/juegos/118b54f3c9d8bea7c563ed893e608c29_dwtxci.jpg', '1');
INSERT INTO public."Imagen" VALUES (5, 2, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433359/juegos/e266227d5e1ac5aaff199bb360576d0f_ehl8aa.webp', '2');
INSERT INTO public."Imagen" VALUES (6, 2, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433365/juegos/6ba42b3e311ef2a1885838c3eae0b88b_zujeec.webp', '3');
INSERT INTO public."Imagen" VALUES (7, 3, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433563/juegos/a55e09318032fcbfc212d030e4bcb4ca_wmgw5v.jpg', '1');
INSERT INTO public."Imagen" VALUES (8, 3, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433568/juegos/7d1ac3585d15dc7223f21f1ea5bb63b4_yd2dmc.webp', '2');
INSERT INTO public."Imagen" VALUES (9, 3, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433575/juegos/c81344920e083606ee7f4a30f19e4bf2_lyggmu.webp', '3');
INSERT INTO public."Imagen" VALUES (10, 4, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433919/juegos/8b4070749c2720d73c923e6e0ce06ec6_wzc7fj.jpg', '1');
INSERT INTO public."Imagen" VALUES (11, 4, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433924/juegos/1d86f4a56ed6a30fb7be770c25d263c7_xb91wn.avif', '2');
INSERT INTO public."Imagen" VALUES (12, 4, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751433932/juegos/d986c3b5cf6bf2ef573740002db74f4c_m7zhdd.jpg', '3');
INSERT INTO public."Imagen" VALUES (13, 5, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751434179/juegos/336dca360ac632a65ce5bf79109be4e6_pwd9o5.avif', '1');
INSERT INTO public."Imagen" VALUES (14, 5, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751434212/juegos/5a76dc6809fc46504a226b33263493b6_uonu5f.webp', '2');
INSERT INTO public."Imagen" VALUES (15, 5, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751434218/juegos/f1d23d2231dccdcaa9029e270326a139_miqljn.webp', '3');
INSERT INTO public."Imagen" VALUES (3, 1, 'https://res.cloudinary.com/dd8jmnal3/image/upload/v1751432938/juegos/958dfe0930b6b4a0dd45c19d1bf08e87_oz1atu.jpg', '3');


--
-- TOC entry 4972 (class 0 OID 34846)
-- Dependencies: 229
-- Data for Name: Noticia; Type: TABLE DATA; Schema: public; Owner: userpw
--



--
-- TOC entry 4964 (class 0 OID 34816)
-- Dependencies: 221
-- Data for Name: Plataforma; Type: TABLE DATA; Schema: public; Owner: userpw
--

INSERT INTO public."Plataforma" VALUES (1, 'PlayStation 5');
INSERT INTO public."Plataforma" VALUES (2, 'Xbox Series X');
INSERT INTO public."Plataforma" VALUES (3, 'Nintendo Switch');
INSERT INTO public."Plataforma" VALUES (4, 'PC');
INSERT INTO public."Plataforma" VALUES (5, 'Mobile');


--
-- TOC entry 4974 (class 0 OID 34855)
-- Dependencies: 231
-- Data for Name: Venta; Type: TABLE DATA; Schema: public; Owner: userpw
--

INSERT INTO public."Venta" VALUES (1, '2025-07-02', 1, 2, '59154cf8cdec820b20d8ec77056266f1', 100.00);
INSERT INTO public."Venta" VALUES (2, '2025-07-02', 1, 5, 'b82d371eb01067eee0f7ac104c279515', 0.99);
INSERT INTO public."Venta" VALUES (3, '2025-07-02', 1, 3, '50d0f66726fcf2548c052b5cee723826', 80.00);
INSERT INTO public."Venta" VALUES (4, '2025-07-02', 1, 4, '46abd35c1b59e52ee36062d1759f0bad', 1.00);
INSERT INTO public."Venta" VALUES (5, '2025-07-02', 1, 1, '1c4055588e195559f3e602111bcafb0a', 120.00);


--
-- TOC entry 4977 (class 0 OID 34870)
-- Dependencies: 234
-- Data for Name: _JuegoPlataforma; Type: TABLE DATA; Schema: public; Owner: userpw
--

INSERT INTO public."_JuegoPlataforma" VALUES (1, 1);
INSERT INTO public."_JuegoPlataforma" VALUES (1, 2);
INSERT INTO public."_JuegoPlataforma" VALUES (1, 4);
INSERT INTO public."_JuegoPlataforma" VALUES (1, 5);
INSERT INTO public."_JuegoPlataforma" VALUES (2, 1);
INSERT INTO public."_JuegoPlataforma" VALUES (2, 2);
INSERT INTO public."_JuegoPlataforma" VALUES (2, 3);
INSERT INTO public."_JuegoPlataforma" VALUES (2, 4);
INSERT INTO public."_JuegoPlataforma" VALUES (2, 5);
INSERT INTO public."_JuegoPlataforma" VALUES (3, 1);
INSERT INTO public."_JuegoPlataforma" VALUES (3, 4);
INSERT INTO public."_JuegoPlataforma" VALUES (4, 4);
INSERT INTO public."_JuegoPlataforma" VALUES (5, 4);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 232
-- Name: Calificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Calificacion_id_seq"', 1, false);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 222
-- Name: Categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Categoria_id_seq"', 5, true);


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 226
-- Name: Imagen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Imagen_id_seq"', 15, true);


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 224
-- Name: Juego_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Juego_id_seq"', 5, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 228
-- Name: Noticia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Noticia_id_seq"', 1, false);


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 220
-- Name: Plataforma_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Plataforma_id_seq"', 5, true);


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 218
-- Name: Usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Usuario_id_seq"', 4, true);


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 230
-- Name: Venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: userpw
--

SELECT pg_catalog.setval('public."Venta_id_seq"', 5, true);


-- Completed on 2025-07-08 23:31:50

--
-- PostgreSQL database dump complete
--

