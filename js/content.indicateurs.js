const pages = [ 
	{
		titre: "Recensement—de—la—population",
	 	span:[
	 		{	
	 			soustitre:"Définitions",
	 			contenu:"<p class='lead intertitre'>La Population Municipale</p>" +
	 					"<p class='lead'>La population municipale comprend les personnes ayant leur résidence habituelle sur le territoire de la commune. Elle inclut les personnes sans abri ou résidant	habituellement dans des habitations mobiles recensées sur le territoire de la commune ainsi que les détenus dans les établissements pénitentiaires de la Commune. C'est la population statistique comparable à la population sans double compte des précédents recensements.</p>" +
						"<p class='lead'>Grâce à la nouvelle méthode de recensement, les données Insee sont publiées chaque année. Elles résultent du traitement statistique des données recueillies par	 sondage sur 5 années d'enquête et sont millésimées du milieu de période (les données millésimées 2013 sont donc issues des enquêtes annuelles menées entre 2011 et 2015). La loi du 27 février 2002 relative à la démocratie de proximité fixe comme premier objectif du recensement de la population la publication tous les ans des chiffres des populations légales&nbsp;: population municipale, population comptée à part et population totale. Ces chiffres sont calculés pour la France, toutes ses communes et circonscriptions administratives. La responsabilité du calcul des populations légales est confiée à l'Insee.</p>" +
						"<p class='lead soustitre'><u>Précautions d'usage</u></p>"+
						"<p class='lead'>Bien que des données soient publiées chaque année, les analyses d'évolution ne peuvent être menées que tous les 5 ans (2 échantillons d'enquête totalement disjoints). Il sera donc préférable de comparer les données 2013 avec celles du recensement 2008. De plus, certaines données nouvellement livrées ne sont pas comparables aux données du recensement de 1999 à cause de changements de concepts ou de questionnements.</p>" +
						"<p class='lead intertitre'>Les Naissances</p>" +
						"<p class='lead'>Toute naissance survenue sur le territoire français fait l'objet d'une déclaration à l'état civil. Depuis mars 1993, l'officier de l'état civil enregistre un acte de naissance si l'enfant a respiré. Dans le cas contraire, il enregistre un acte d'enfant sans vie. Les renseignements sont demandés au déclarant, et chaque fois qu'il est possible, contrôlés d'après le livret de famille. Le fichier annuel des naissances est le résultat de l'exploitation des bulletins d'état civil envoyés par les mairies ayant enregistré des naissances</p>" +
						"<p class='lead intertitre'>Les Ménages</p>" +
						"<p class='lead'>De manière générale, un ménage, au sens statistique du terme, désigne l'ensemble des occupants d'un même logement sans que ces personnes soient nécessairement unies par des liens de parenté (en cas de cohabitation, par exemple). Un ménage peut être composé d'une seule personne.</p>",
				},
			],
		sources:[	
			{
				nom:"INSEE RP",
				annee:"2008 et 2013",
				lien:"https://www.insee.fr/fr/information/2008354",
			},
		],
		charts: [
		 	{
		 		titre:"Population totale par circonscription (2013)",
		 		valeur_init:"Général_Population_Total",
		 	 	buttons:[],
		 	},
		 	{
		 		titre: "Répartition de la population par tranches d'âges (2013)",
		 		valeur_init:"Général_Population_Tranches d'âge_0-2 ans_2013",
		 	 	buttons: [ 
			 	 	{
			 	 		label: "0 - 2",
			 	 		value: "Général_Population_Tranches d'âge_0-2 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "3 - 5",
			 	 		value: "Général_Population_Tranches d'âge_3-5 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "6 - 11",
			 	 		value: "Général_Population_Tranches d'âge_6-11 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "12 - 15",
			 	 		value: "Général_Population_Tranches d'âge_12-15 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "16 - 19",
			 	 		value: "Général_Population_Tranches d'âge_16-19 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "20 - 24",
			 	 		value: "Général_Population_Tranches d'âge_20-24 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "25 - 59",
			 	 		value: "Insertion_Population",
			 	 		ticks: "Insertion_Population",
			 	 		echelle_label: "100.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "60 - 79",
			 	 		value: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "80 - 84",
			 	 		value: "Général_Population_Tranches d'âge_80-84 ans_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	},
			 	 	{
			 	 		label: "85 et +",
			 	 		value: "Général_Population_Tranches d'âge_85 ans ou +_2013",
			 	 		ticks: "Général_Population_Tranches d'âge_60-79 ans_2013",
			 	 		echelle_label: "10.000 personnes"
			 	 	}
		 	 	],

		 	},
		 	{
		 		titre:"Nombre de naissances (2015)",
		 		valeur_init:"Enfance_Naissances_2015",
		 	 	buttons:[],
		 	},
		 	{
		 		titre:"Nombre de ménages (2013)",
		 		valeur_init:"Général_Ménages_2013",
		 	 	buttons:[],
		 	}
		]
	
	},
	{
		titre:"Les—Aides",
	 	span:
	 		[ 
	 			{
	 				soustitre:"Les—aides—à—l'enfance",
	 				contenu:"<p class='lead'>On compte deux types d'aides à l'enfance versées par la Caisse d'Allocations Familiales, et quatre versées par le Département.</p>" +
	 						"<p class='lead intertitre'> La prestation d'accueil du jeune enfant (PAJE)</p>" + 
	 						"<p class='lead'>La PAJE est une aide financière versée aux parents jusqu’aux 3 ans de l’enfant (6 ans pour le complément de libre choix du mode de garde). Elle comprend une prime à la naissance (ou à l'adoption) et l’allocation de base, la prestation partagée d'éducation de l'enfant ou le complément de libre choix d’activité si vous ou l’autre parent réduisez votre temps de travail ou arrêtez de travailler pour garder votre enfant, ainsi que le complément de libre choix du mode de garde, si vous choisissez de faire garder votre enfant par une assistante maternelle agréée, une garde d’enfants à domicile, une association, une entreprise ou une micro-crèche.</p>" +
         					"<p class='lead intertitre'> L'Allocation d'Education de l'Enfant Handicapé (AEEH)</p>" +
         					"<p class='lead'>L’AEEH est une prestation destinée à compenser les frais d'éducation et de soins apportés à un enfant en situation de handicap. Cette aide est versée à la personne qui en assume la charge.</p>" +
         					"<p class='lead intertitre'> Les aides à l'enfance du département </p>" +
         					"<p class='lead soustitre'><u>L' Allocation Mensuelle (AM)</u></p>"+
         					"<p class='lead'>Aide financière ponctuelle accordée au titre de la protection de l’enfance lorsqu’une famille ne dispose pas de ressources suffisantes pour subvenir aux besoins courants de ses enfants.</p>" +
         					"<p class='lead soustitre'><u>Les aides Secours d'Urgence (SU)</u></p>"+
         					"<p class='lead'>Aide financière d'urgence, pour répondre à une difficulté lorsque la santé de l'enfant, sa sécurité, son entretien ou son éducation le nécessitent. Le versement urgent doit être justifié.</p>" +
         					"<p class='lead soustitre'><u>Fonds d'Aide aux Jeunes (FAJ)</u></p>"+
         					"<p class='lead'>Aides destinées à favoriser l'insertion sociale et professionnelle des 18-25 ans en leur apportant des secours temporaires sous la forme d'aides financières ou de prestations d'accompagnement social.Il s'agit d'aides ponctuelles et de faible montant qui doivent répondre à un besoin précis (logement, travail, transport...).</p>" +
         					"<p class='lead soustitre'><u>Fonds d'Aide aux Jeunes d'Urgence (FAJU)</u></p>"+
         					"<p class='lead'>Similaire au FAJ, mais pouvant être versé immédiatement.</p>",
				},
				{
					soustitre:"Les aides à l'insertion",
					contenu:"<p class='lead intertitre'> Le Revenu de Solidarité Active (RSA) </p>" + 
							"<p class='lead'>Il s'agit d'une allocation qui vise à remplacer les deux minimas sociaux existants (RMI et API), à se substituer à des dispositifs d'intéressement de retour à l'emploi comme la prime de retour à l'emploi (PRE) et la prime pour l'emploi (PPE). Son montant dépend de la composition et des revenus du ménage. Il se décline en trois types : RSA Socle, RSA Socle Activité, et RSA Activité. Ici, les données présentent une aggrégation de ces trois types.</p>" +
         					"<p class='lead soustitre'><u>RSA Activité</u></p>"+
         					"<p class='lead'>Intégralement financé par l'Etat, il correspond aux personnes ayant touché plus de 500€ en revenus d'activité, mais moins de 1000€ environ.</p>" +
         					"<p class='lead soustitre'><u>RSA Socle</u></p>"+
         					"<p class='lead'>Cette allocation est versée par le Département et concerne les personnes sans activité salariée sur la période considérée.</p>" +
         					"<p class='lead soustitre'><u>RSA Socle Activité</u></p>"+
         					"<p class='lead'>Il s'agit des personnes ayant gagné moins de 500€ de salaire d'activité dans le mois considéré. Elle est elle aussi versée par le Département.</p>" +
         					"<p class='lead intertitre'> Le Fonds de Solidaité Logement (FSL)</p><p class='lead'>Aide financière qui vise à aider les personnes rencontrant des difficultés financières pour accéder au logement ou s’y maintenir. Le FSL permet par exemple de prendre en charge le dépôt de garantie lors de l’arrivée dans un logement ou le paiement de factures (électricité, gaz, eau, …) afin de faciliter le maintien.</p>",
				},
				{
					soustitre:"Les aides à l'autonomie",
					contenu:"<p class='lead intertitre'> L'Allocation Personnalisée d'Autonomie (APA) </p>" + 
					    	"<p class='lead'> L'APA est une allocation attribuée aux personnes âgées d'au moins 60 ans qui se trouvent en situation de perte d'autonomie, nécessitant une aide pour l'accomplissement des actes de la vie courante. Elle concerne à la fois les personnes âgées résidant à domicile et celles demeurant en établissement.</p>" +
					    	"<p class='lead soustitre'><u>Les Groupes Iso-Ressources (GIR)</u></p>"+
					    	"<p class='lead'>Ils permettent de classer les personnes en fonction des différents stades de perte d'autonomie. Ils sont au nombre de 6, le groupe 1 marque le niveau de dépendance le plus élevé. Les GIR 5 et 6 n'entrent pas dans le champ de l'APA.</p>" +       
         					"<p class='lead intertitre'> Prestation de Compensation du Handicap (PCH)</p>" + 
         					"<p class='lead'>La PCH est une aide financière versée par le département. Elle est destinée à rembourser les dépenses liées à votre perte d'autonomie. Son attribution dépend de votre degré d'autonomie, de votre âge, de vos ressources et de votre résidence.</p>" +
        					"<p class='lead intertitre'> Le minimum veillesse </p>" +
        					"<p class='lead'>Le minimum vieillesse (appelée depuis 2005 Allocation de solidarité aux personnes âgées ou ASPA) est une prestation sociale française versée sans contrepartie de cotisation, créée en 1956. Son objectif est d'apporter un complément de ressources pour porter au niveau du minimum vieillesse les revenus des personnes âgées disposant de faibles moyens d'existence. Constitué de différentes allocations, il a été simplifié en 2006 en une prestation unique, l'allocation de solidarité aux personnes âgées (ASPA), mais ses différentes allocations persistent pour les personnes qui ont commencé à en bénéficier avant 2006.</p>",				
     		},
		],
		sources: [
			{
				nom:"CAF",
				annee:"2015",
				lien:"http://data.caf.fr/category/statistiques-allocataires-prestations-et-services",
			},
			{
				nom:"Département",
				annee:"2016",
				lien:"https://www.isere.fr",
			},
			{
				nom:"CARSAT",
				annee:"2016",
				lien:"https://www.observatoires-fragilites-grand-sud.fr/#c=indicator&f=00000&i=diag_rg_com.score_moyen&s=2017&view=map58",
			},
		],
		charts: [
		 	{
		 		titre:"Allocataires de la Prestation d'Accueil du jeune Enfant",
		 		valeur_init:"Enfance_Aides_Prestations Acc. Jeune Enfant",
		 	 	buttons:[],
		 	},
		 	{
		 		titre:"Bénéficiaires de l'AEEH",
		 		valeur_init:"Enfance_Aides_All. Edu. Enf. Handicapé_Allocataires",
		 	 	buttons:[
		 	 		{
			 	 		label: "Allocataires",
			 	 		value: "Enfance_Aides_All. Edu. Enf. Handicapé_Allocataires",
			 	 		ticks: "Enfance_Aides_All. Edu. Enf. Handicapé_Enfants bénéficiaires",
			 	 		echelle_label:""
			 	 	},
			 	 	{
			 	 		label: "Enfants",
			 	 		value: "Enfance_Aides_All. Edu. Enf. Handicapé_Enfants bénéficiaires",
			 	 		ticks: "Enfance_Aides_All. Edu. Enf. Handicapé_Enfants bénéficiaires",
			 	 		echelle_label:""
			 	 	}
			 	 ],
		 	},
		 	{
		 		titre:"Nombre d'aides à l'enfance accordées par le département",
		 		valeur_init:"Enfance_Aides_Aides départementales_AM",
		 	 	buttons:[
		 	 		{
			 	 		label: "AM",
			 	 		value: "Enfance_Aides_Aides départementales_AM",
			 	 		ticks: "Enfance_Aides_Aides départementales_AM",
			 	 		echelle_label:""
			 	 	},
			 	 	{
			 	 		label: "SU",
			 	 		value: "Enfance_Aides_Aides départementales_SU",
			 	 		ticks: "Enfance_Aides_Aides départementales_AM",
			 	 		echelle_label:""
			 	 	},
			 	 	{
			 	 		label: "FAJ",
			 	 		value: "Enfance_Aides_Aides départementales_FAJ",
			 	 		ticks: "Enfance_Aides_Aides départementales_AM",
			 	 		echelle_label:""
			 	 	},
			 	 	{
			 	 		label: "FAJU",
			 	 		value: "Enfance_Aides_Aides départementales_FAJU",
			 	 		ticks: "Enfance_Aides_Aides départementales_AM",
			 	 		echelle_label:""
			 	 	}
			 	 ],
		 	}, 
		 	{
		 		titre:"Population couverte par le RSA",
		 		valeur_init:"Insertion_Aides_RSA_Population couverte",
		 	 	buttons:[
		 	 		{
			 	 		label: "Personnes",
			 	 		value: "Insertion_Aides_RSA_Population couverte",
			 	 		ticks: "Insertion_Aides_RSA_Population couverte",
			 	 		echelle_label:""
			 	 	},
			 	 	{
			 	 		label: "Foyers",
			 	 		value: "Insertion_Aides_RSA_Foyers Alloc._2015",
			 	 		ticks: "Insertion_Aides_RSA_Population couverte",
			 	 		echelle_label:""
			 	 	},
			 	 ],
		 	}, 
		 	{
		 		titre:"Ménages allocataires FSL",
		 		valeur_init:"Insertion_Aides_Alloc. FSL",
		 	 	buttons:[]
		 	},
		 	{
		 		titre:"Nombre d'allocataires APA (2016)",
		 		valeur_init:"Autonomie_Aides_Alloc. Personnalisée d'Autonomie_Domicile_Année_2016",
		 	 	buttons:[
		 	 		{
			 	 		label: "À Domicile",
			 	 		value: "Autonomie_Aides_Alloc. Personnalisée d'Autonomie_Domicile_Année_2016",
			 	 		ticks: "Autonomie_Aides_Alloc. Personnalisée d'Autonomie_Domicile_Année_2016",
			 	 		echelle_label:""
			 	 	},
			 	 	{
			 	 		label: "En Établissement",
			 	 		value: "Autonomie_Aides_Alloc. Personnalisée d'Autonomie_Établissement_Année_2016",
			 	 		ticks: "Autonomie_Aides_Alloc. Personnalisée d'Autonomie_Domicile_Année_2016",
			 	 		echelle_label:""
			 	 	},
			 	 ],
		 	},
		 	{
		 		titre:"Bénéficiaires de la PCH",
		 		valeur_init:"Autonomie_Aides_Bénéficiaires de Presta. de Comp. du Handicap",
		 	 	buttons:[]
		 	},
		 	{
		 		titre:"Bénéficaires du minimum vieillesse (2016)",
		 		valeur_init:"Autonomie_Aides_Bénéficiaires du Minimum vieillesse 2016",
		 	 	buttons:[]
		 	},
		 ]
	},
	{
		titre: "Les—indicateurs—économiques",
	 	span:[
	 		{	
	 			soustitre:"Définitions",
	 			contenu:"<p class='lead intertitre'>Foyers Fiscaux</p>" + 
	 					"<p class='lead'> Le terme  foyer fiscal désigne l'ensemble des personnes inscrites sur une même déclaration de revenus. (NB: Il peut y avoir plusieurs foyers fiscaux dans un seul ménage : par exemple, un couple non marié où chacun remplit sa propre déclaration de revenus compte pour deux foyers fiscaux.) Sont considérées comme ayant leur domicile fiscal en France les personnes : qui ont en France leur foyer ou le lieu de leur séjour principal ou qui exercent en France une activité professionnelle, salariée ou non, à moins qu'elles ne justifient que cette activité y est exercée à titre accessoire, ou encore qui ont en France le centre de leurs intérêts économiques.</p>"+
	 					"<p class='lead intertitre'>Foyers Fiscaux Imposables</p><p class='lead'>C'est sur la base du foyer fiscal qu'est calculé l'impôt sur le revenu sur le total des revenus imposables du contribuable, de son conjoint marié ou pacsé, des enfants et autres personnes à charge.</p>"+
	 					"<p class='lead intertitre'>Revenu Fiscal Moyen</p>"+
	 					"<p class='lead'>Le revenu net moyen est calculé à partir du montant des déclarations d'impôts de tous les foyers fiscaux du département et du nombre de foyers recensés dans le département.</p>"+
	 					"<p class='lead intertitre'>Foyers à Bas Revenu</p>"+
	 					"<p class='lead'>Un foyer est dit à \"bas revenus\" lorsque son revenu par unité de consommation est inférieur à Ȝ0 % du revenu médian par unité de consommation de la population de référence. Pour des raisons méthodologiques, certains allocataires dont les ressources sont mal appréhendées ou inconnues sont exclus de l'approche revenus, notamment les étudiants ne percevant qu'une aide au logement, les allocataires de 65 ans ou plus et ceux dont le conjoint est âgé de 65 ans ou plus (le minimum vieillesse n'étant pas imposable). Le seuil des bas revenus est fixé à 1001€ par unité de consommation pour les données au 31/12/2012 (ressources 2011).</p>",
				},
			],
		sources:[	
			{
				nom:"DGFiP",
				annee:"Déclaration 2014 revenus 2013",
				lien:"https://www.impots.gouv.fr/portail/statistiques",
			},
		],
		charts: [
		 	{	
		 		titre:"Foyers fiscaux",
		 		valeur_init:"Général_Foyers fiscaux_tous",
		 	 	buttons:[
		 	 		{
		 	 			label: "Total",
			 	 		value: "Général_Foyers fiscaux_tous",
			 	 		ticks: "Général_Foyers fiscaux_tous",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Imposables",
			 	 		value: "Général_Foyers fiscaux_imposables",
			 	 		ticks: "Général_Foyers fiscaux_tous",
			 	 		echelle_label:""
		 	 		},

		 	 	],
		 	},
		 	{
		 		titre:"Revenu fiscal moyen",
		 		valeur_init:"Général_Revenu Fiscal Moyen",
		 	 	buttons:[]

		 	},
		 	{
		 		titre:"Foyers à Bas Revenu",
		 		valeur_init:"Insertion_Aides_Alloc. Bas Revenu 2015",
		 	 	buttons:[
					{
		 	 			label: "Foyers Allocataires",
			 	 		value: "Insertion_Aides_Alloc. Bas Revenu 2015",
			 	 		ticks: "Insertion_Aides_Alloc. Bas Revenu 2015",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Nombre d'enfants",
			 	 		value: "Enfance_Enfants < 6ans dans ménage_bas-revenus",
			 	 		ticks: "Insertion_Aides_Alloc. Bas Revenu 2015",
			 	 		echelle_label:""
		 	 		},
		 	 	],

		 	},
		],
	},
	{
		titre: "Lieux—de—Résidence",
	 	span:[
	 		{	
	 			soustitre:"Définitions",
	 			contenu:" <p class='lead intertitre'>Résidences principales</p>"+
	 					"<p class='lead'> Une résidence principale est un logement occupé de façon habituelle et à titre principal par une ou plusieurs personnes.</p>"+
	 					"<p class='lead intertitre'>Le parc public</p>"+
	 					"<p class='lead'>Chaque année, l'Insee réalise, en partenariat avec le SDES, un travail de synthèse et de mise en cohérence de plusieurs sources, pour chiffrer le parc public des logements ordinaires et le décrire en fonction de la catégorie de logement (résidence principale, résidence secondaire ou logement occasionnel, logement vacant), le type d'habitat (collectif, individuel), le statut d'occupation (ou la filière) et la zone géographique (par taille d'unité urbaine).</p>"+
	 					"<p class='lead intertitre'>Les EPHAD</p>"+
	 					"<p class='lead'>Les EHPAD (établissements d’hébergement pour personnes âgées dépendantes) sont des maisons de retraite médicalisées qui proposent un accueil en chambre. Les EHPAD s’adressent à des personnes âgées de plus de 60 ans qui ont besoin d’aide et de soins au quotidien.</p>",
				},
			],
		sources:[	
			{
				nom:"INSEE RP",
				annee:"2013",
				lien:"https://www.insee.fr/fr/information/2008354",
			},
		],
		charts: [
		 	{	
		 		titre:"Nombre de résidences principales",
		 		valeur_init:"Insertion_Résidences_Principales",
		 	 	buttons:[
		 	 		{
		 	 			label: "Total",
			 	 		value: "Insertion_Résidences_Principales",
			 	 		ticks: "Insertion_Résidences_Principales",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Propriétaires",
			 	 		value: "Insertion_Résidences_Types_propriétaires",
			 	 		ticks: "Insertion_Résidences_Principales",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Locataires",
			 	 		value: "Insertion_Résidences_Types_locataires",
			 	 		ticks: "Insertion_Résidences_Principales",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Locataires du parc public",
			 	 		value: "Insertion_Résidences_Types_locataires du parc public",
			 	 		ticks: "Insertion_Résidences_Principales",
			 	 		echelle_label:""
		 	 		},

		 	 	],
		 	},
		 	{
		 		titre:"Les EPHAD",
		 		valeur_init:"Autonomie_Résidences_EHPAD_établissements",
		 	 	buttons:[
		 	 		{
		 	 			label: "établissements",
			 	 		value: "Autonomie_Résidences_EHPAD_établissements",
			 	 		ticks: "Autonomie_Résidences_EHPAD_établissements",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "places",
			 	 		value: "Autonomie_Résidences_EHPAD_places",
			 	 		ticks: "Autonomie_Résidences_EHPAD_établissements",
			 	 		echelle_label:""
		 	 		},
		 	 	],

		 	},
		 	{
		 		titre:"Logement des personnes de 80 ans et +",
		 		valeur_init:"Autonomie_Résidences_Logement des 80 ans et +_ordinaire",
		 	 	buttons:[
		 	 		{
		 	 			label: "logement ordinaire",
			 	 		value: "Autonomie_Résidences_Logement des 80 ans et +_ordinaire",
			 	 		ticks: "Autonomie_Résidences_Logement des 80 ans et +_ordinaire",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "établissement",
			 	 		value: "Autonomie_Résidences_Logement des 80 ans et +_établissement",
			 	 		ticks: "Autonomie_Résidences_Logement des 80 ans et +_ordinaire",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "autre",
			 	 		value: "Autonomie_Résidences_Logement des 80 ans et +_autres",
			 	 		ticks: "Autonomie_Résidences_Logement des 80 ans et +_ordinaire",
			 	 		echelle_label:""
		 	 		},
		 	 	],

		 	},
		]
	},
	{
		titre: "Les—établissements—scolaires",
	 	span:[
	 		{	
	 			soustitre:"Types d'établissement",
	 			contenu:"<p class='lead'>Sont recensés ici tous les établissements scolaires, qu'ils soient publics ou privés.</p>"+
	 				"<p class='lead intertitre'>Les écoles du 1er degré</p>"+
         			"<p class='lead soustitre'><u>Les écoles maternelles</u></p>"+
         			"<p class='lead'>L'école maternelle peut accueillir les enfants avant l'instruction obligatoire qui débute à 6 ans. Il s'agit d'une originalité du système français. Elle est le plus souvent organisée en petite, moyenne et grande section, en fonction de l'âge des enfants. Les locaux des écoles appartiennent aux communes qui ont la charge de leur entretien.</p>"+
         			"<p class='lead soustitre'><u>Les école élémentaires</u></p>"+
         			"<p class='lead'>L'école élémentaire accueille les enfants scolarisés de 6 à 11 ans. Elle est mixte et gratuite si elle est publique. Elle comporte deux cycles : le cycle 2 (CP, CE1, CE2) et le cycle 3 (CM1 et CM2). Les locaux des écoles appartiennent aux communes qui ont la charge de leur entretien.</p>"+
         			"<p class='lead intertitre'> Les collèges</p>"+
         			"<p class='lead'>Le collège est l'établissement de niveau secondaire qui, à l'issue de l'école élémentaire, accueille tous les enfants scolarisés. Ils y suivent quatre années de scolarité de la sixième à la troisième. Les collèges publics sont des établissements publics locaux d'enseignement (EPLE). Ils définissent et mettent en œuvre un projet d'établissement, qui leur permet de prendre des initiatives et d'être autonomes. La gestion de leurs bâtiments relève des départements en application des lois de décentralisation.</p>",
				},
			],
		sources:[	
			{
				nom:"DSDEN",
				annee:"Rentrée 2015",
				lien:"http://www.ac-grenoble.fr/ia38/siteiaspip/",
			},
		],
		charts: [
		 	{	
		 		titre:"Nombre d'établissements scolaires",
		 		valeur_init:"Enfance_Écoles_Établissements_Premier degré",
		 	 	buttons:[
		 	 		{
		 	 			label: "Écoles 1er degré",
			 	 		value: "Enfance_Écoles_Établissements_Premier degré",
			 	 		ticks: "Enfance_Écoles_Établissements_Premier degré",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Collèges",
			 	 		value: "Enfance_Écoles_Établissements_Collège",
			 	 		ticks: "Enfance_Écoles_Établissements_Premier degré",
			 	 		echelle_label:""
		 	 		},
		 	 	],
		 	},
		 	{	
		 		titre:"Effectifs",
		 		valeur_init:"Enfance_Écoles_Effectif_Maternelle",
		 	 	buttons:[
		 	 		{
		 	 			label: "Maternelles",
			 	 		value: "Enfance_Écoles_Effectif_Maternelle",
			 	 		ticks: "Enfance_Écoles_Effectif_Collège",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Élémentaires",
			 	 		value: "Enfance_Écoles_Effectif_Élémentaire",
			 	 		ticks: "Enfance_Écoles_Effectif_Collège",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Collèges",
			 	 		value: "Enfance_Écoles_Effectif_Collège",
			 	 		ticks: "Enfance_Écoles_Effectif_Collège",
			 	 		echelle_label:""
		 	 		},
		 	
		 		],
		 	},
		],
	},
	{
		titre: "Les—services—à—l'enfance",
	 	span:[
	 		{	
	 			soustitre:"Définitions",
	 			contenu:"<p class='lead intertitre'>Assistance Maternelle</p>"+
	 					"<p class='lead'>L'assistant(e) maternel(le) accueille un ou plusieurs enfants de moins de 6 ans à son domicile pendant que les parents travaillent. Il doit être agrée par le Département après avis des services de la protection maternelle et infantile. Cet agrément lui reconnaît un statut professionnel. Le Département favorise le développement du métier d'assistant maternel, sa reconnaissance et sa qualité, en prenant en charge l'agrément, la formation, mais aussi un accompagnement professionnel.</p>" + 
	 					"<p class='lead intertitre'>Transport scolaire</p>" + 
	 					"<p class='lead'>Depuis septembre 2015, le transport scolaire est gratuit pour les élèves isérois domiciliés et inscrits dans un établissement isérois si leur domicile et leur établissement scolaire ne se trouvent pas tous les deux dans la même communauté de communes ou d’agglomération.</p>",
				},
			],
		sources:[	
			{
				nom:"Département",
				annee:"2015 et 2016",
				lien:"https://www.isere.fr",
			},
		],
		charts: [
		 	{	
		 		titre:"Assistance Maternelle",
		 		valeur_init:"Enfance_Ass. Maternelles_places",
		 	 	buttons:[
		 	 		{
		 	 			label: "Places disponibles",
			 	 		value: "Enfance_Ass. Maternelles_places",
			 	 		ticks: "Enfance_Ass. Maternelles_places",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Nombre d'Ass.Mat.",
			 	 		value: "Enfance_Ass. Maternelles_nombre",
			 	 		ticks: "Enfance_Ass. Maternelles_places",
			 	 		echelle_label:""
		 	 		},
		 	 	],
		 	},
		 	{
		 		titre:"Accueil du Jeune Enfant (2016)",
		 		valeur_init:"Enfance_Étab. Acc. Jeune Enfant_nombre",
		 	 	buttons:[
		 	 		{
		 	 			label: "Établissements",
			 	 		value: "Enfance_Étab. Acc. Jeune Enfant_nombre",
			 	 		ticks: "Enfance_Étab. Acc. Jeune Enfant_places",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Places disponibles",
			 	 		value: "Enfance_Étab. Acc. Jeune Enfant_places",
			 	 		ticks: "Enfance_Étab. Acc. Jeune Enfant_places",
			 	 		echelle_label:""
		 	 		},
		 	 	],
		 	},
		 	{
		 		titre:"Elèves transportés (2016)",
		 		valeur_init:"Enfance_Écoles_Elèves transportés",
		 	 	buttons:[],
		 	},
		],
	},
	{
		titre: "Les—indicateurs—liés—à—l'emploi",
	 	span:[
	 		{	
	 			soustitre:"Définitions",
	 			contenu:"<p class='lead intertitre'>Les Demandeurs d'Emploi en Fin de Mois (DEFM)</p>"+
	 					"<p class='lead'>Les demandeurs d'emploi en fin de mois (DEFM) sont les personnes inscrites à Pôle Emploi et ayant une demande en cours au dernier jour du mois.</p>"+
	 					"<p class='lead soustitre'><u>Précision des catégories de DEFM </u></p>"+
	 					"<p class='lead'><strong>• Catégorie A : </strong>demandeurs d'emploi inscrits à Pôle Emploi, tenus de faire des actes positifs de recherche d'emploi, sans emploi"+
	 					"<br/></br><strong>• Catégorie B : </strong>Demandeurs d'emploi inscrits à Pôle Emploi, tenus de faire des actes positifs de recherche d'emploi, ayant exercé une activité réduite courte (i.e., de 78 heures ou moins au cours du mois)"+
	 					"<br/><br/><strong>• Catégorie C : </strong>Demandeurs d'emploi inscrits à Pôle Emploi, tenus de faire des actes positifs de recherche d'emploi, ayant exercé une activité réduite longue (i.e de 78 heures ou moins au cours du mois).</p>"+
	 					"<p class='lead intertitre'>Les emplois </p>"+
	 					"<p class='lead'> L'emploi total comprend l'emploi salarié et l'emploi non salarié. Les séries annuelles d'emploi total sont estimées depuis septembre 2009 avec le dispositif ESTEL (estimations d'emploi localisé) par département, région, statut et secteur d'activité à partir de deux sources principales : les déclarations annuelles de données sociales (DADS) dites « grand format » parce qu'elles incluent les effectifs de la fonction publique d'État et les salariés des particuliers employeurs, auxquelles on ajoute les effectifs des non salariés. L'unité mesurée est le nombre de personnes en emploi. L'emploi est exprimé en nombre de personnes, c'est à dire corrigé de la multi-activité de certains travailleurs.</p>",
				},
			],
		sources:[	
			{
				nom:"Pôle Emploi",
				annee:"Rentrée 2015",
				lien:"https://www.pole-emploi.fr/region/auvergne-rhone-alpes/informations/statistiques-et-analyses-@/region/auvergne-rhone-alpes/index.jspz?id=419660",
			},
			{
				nom:"INSEE RP",
				annee:"2013",
				lien:"https://www.insee.fr/fr/metadonnees/definition/c1504",
			},
		],
		charts: [
			{
				titre:"Nombre de demandeurs d'emploi (2015)",
		 		valeur_init:"Insertion_Demandeurs d'emploi_Total_2015",
		 	 	buttons:[
		 	 		{
		 	 			label: "Total",
			 	 		value: "Insertion_Demandeurs d'emploi_Total_2015",
			 	 		ticks: "Insertion_Demandeurs d'emploi_Total_2015",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "- 25 ans",
			 	 		value: "Insertion_Demandeurs d'emploi_Types_Age_< 25 ans",
			 	 		ticks: "Insertion_Demandeurs d'emploi_Total_2015",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "+ 50 ans",
			 	 		value: "Insertion_Demandeurs d'emploi_Types_Age_> 50 ans",
			 	 		ticks: "Insertion_Demandeurs d'emploi_Total_2015",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Très longue durée",
			 	 		value: "Insertion_Demandeurs d'emploi_Types_Très longue durée",
			 	 		ticks: "Insertion_Demandeurs d'emploi_Total_2015",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Femmes",
			 	 		value: "Insertion_Demandeurs d'emploi_Types_Sexe_homme",
			 	 		ticks: "Insertion_Demandeurs d'emploi_Total_2015",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "Hommes",
			 	 		value: "Insertion_Demandeurs d'emploi_Types_Sexe_femme",
			 	 		ticks: "Insertion_Demandeurs d'emploi_Total_2015",
			 	 		echelle_label:""
		 	 		},
		 	 	],
			},
			{
				titre:"Emplois (salariés et non-salariés)",
		 		valeur_init:"Insertion_Emplois_Total",
		 	 	buttons:[
		 	 		{
		 	 			label: "Total",
			 	 		value: "Insertion_Emplois_Total",
			 	 		ticks: "Insertion_Emplois_Total",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "secteur agricole",
			 	 		value: "Insertion_Emplois_Secteurs_agricole",
			 	 		ticks: "Insertion_Emplois_Total",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "secteur construction",
			 	 		value: "Insertion_Emplois_Secteurs_construction",
			 	 		ticks: "Insertion_Emplois_Total",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "secteur industriel",
			 	 		value: "Insertion_Emplois_Secteurs_industriel",
			 	 		ticks: "Insertion_Emplois_Total",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "secteur du service",
			 	 		value: "Insertion_Emplois_Secteurs_service",
			 	 		ticks: "Insertion_Emplois_Total",
			 	 		echelle_label:""
		 	 		},
		 	 		{
		 	 			label: "secteur public",
			 	 		value: "Insertion_Emplois_Secteurs_publique",
			 	 		ticks: "Insertion_Emplois_Total",
			 	 		echelle_label:""
		 	 		},
		 	 	],
			},
		],
	},

]