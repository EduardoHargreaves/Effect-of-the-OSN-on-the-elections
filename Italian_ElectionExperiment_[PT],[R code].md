
Este notebook foi usado para analisar os dados produzidos durante os experimentos da eleição presidencial Italiana de 2018.
O dataset pode ser baixado em: https://github.com/tracking-exposed/experiments-data/tree/master/e18.


Se você utilizar este código ou dataset, por favor, nos cite usando a seguinte texto no formato BibTex:

```
@inproceedings{Hargreaves2018c, author = {Hargreaves, Eduardo and Menasché, Daniel and Neglia, Giovanni and Agosti, Claudio}, booktitle = {In Proceedings of the VII Brazilian Workshop on Social Network Analysis and Mining (BraSNAM)}, title = {{Visibilidade no Facebook : Modelos , Medi{\c{c}}{~{o}}es e Implica{\c{c}}{~{o}}es}}, year = {2018} }
```

```
{r message=FALSE, warning=FALSE}
library(lubridate)
library(jsonlite)
library(dplyr)
library(tidyr)
library(tidyverse)
library(plotly)
library(stringr)
library(magrittr)
library(broom)
library(forcats)
library(modelr) 
options(na.action = na.warn)
library(Metrics)
```

#Dataset Loading and Filtering

```{r}
#dataset_FB_API<- read.csv('/Users/Eduardo/Google Drive/Facebook Experiments/Italian_dataset/FB_API_Italian_experiment.csv')
#dataset_FB_API<- dataset_FB_API %>% filter(!is.na(author_id), !is.na(publisherOrientation))
#dataset_FB_API<- read.csv('/Users/Eduardo/Google Drive/Facebook Experiments/Italian_dataset/api-posts-e18.csv')
#dataset_FB_API <- filter(dataset_FB_API,publicationTime > '2018-01-09')

```

```{r}
dataset <- fromJSON('/Users/Eduardo/Google Drive/Facebook Experiments/Italian_dataset/opendata-e18.array.json')
dataset_FB_API <- fromJSON('/Users/Eduardo/Google Drive/Facebook Experiments/Italian_dataset/api-posts-e18.array.json')
```


```{r}
# parameters
top_positions <- 1
periodBegin <- '2018-01-06'
periodEnd <- '2018-03-06'

```


```{r}
#head(dataset)
dataset$`_id` <- NULL
dataset_FB_API$fromName <- dataset_FB_API$from$name
dataset_FB_API <- dataset_FB_API %>% select(-`_id`,-`from`,-`likes`,-`shares`)
#dataset <- dataset %>% mutate(publisherName=replace(publisherName,which(publisherName=="Articolo UNO - Movimento Democratico e Progressista"),"Articolo UNO"))
dataset_FB_API <- dataset_FB_API %>% filter(publisherName==fromName)
#dataset_FB_API <- dataset_FB_API %>% mutate(publisherName=replace(publisherName,which(publisherName=="Articolo UNO - Movimento Democratico e Progressista"),"Articolo UNO"))
dataset <- filter(dataset, impressionTime >= periodBegin & impressionTime <= periodEnd)
dataset_FB_API <- filter(dataset_FB_API, created_time >= periodBegin  & created_time <= periodEnd ) 
```



It is possible to see that the number of posts per snaphots isn't constant. By slicing the dataset, it is possible to see that some posts are missing in some snapshots.


```{r}
top_dataset <- filter(dataset,impressionOrder<=top_positions  & impressionTime < period) 
```

#Factor enhancements to help the visualization
```{r Factor Creation}

dataset <- dataset %>% mutate(publisherName = fct_recode(publisherName, 
  "Lega Salvini"= "Lega - Salvini Premier",
  "Fascisti uniti"=
    "Fascisti uniti per L'italia",
  "M5S"="MoVimento 5 Stelle",
  "Il Primato..." = 	"Il Primato Nazionale",
  "Il Fatto Quoti"="Il Fatto Quotidiano",
  "M. RenziNs"="Matteo Renzi News",
  "P. Democratico"="Partito Democratico",
  "Il manifesto"="il manifesto",
  "La Repubblica"="la Repubblica",
  "L.Borgonzoni"="Lucia Borgonzoni",
  "Adesso ti inf"="Adesso ti informo",
  "CasaPound"="CasaPound Italia",
  "Lotta Studt"="Lotta Studentesca",
  "Articolo UNO"="Articolo UNO - Movimento Democratico e Progressista"
))

dataset <- dataset %>% mutate(publisherOrientation = fct_recode(publisherOrientation, 
  "esquerda"= "left",
  "direita"=
    "right",
  "M5S"="MoVimento 5 Stelle",
  "ultra-direita" = 	"far-right",
  "centro-esquerda"="center-left"
))

dataset <- dataset %>% mutate(profileAlign = fct_recode(profileAlign, 
  "esquerda"= "left",
  "direita"=
    "right",
  "M5S"="MoVimento 5 Stelle",
  "ultra-direita" = 	"far-right",
  "centro-esquerda"="center-left",
  "indeciso"="undecided"
))

dataset_FB_API <- dataset_FB_API %>% mutate(publisherOrientation = fct_recode(publisherOrientation, 
  "esquerda"= "left",
  "direita"="right",
  "M5S"="MoVimento 5 Stelle",
  "ultra-direita" = 	"far-right",
  "centro-esquerda"="center-left"
))


dataset_FB_API <- dataset_FB_API %>% mutate(publisherName = fct_recode(publisherName, 
 "Lega Salvini"= "Lega - Salvini Premier",
  "Fascisti uniti"=
    "Fascisti uniti per L'italia",
  "M5S"="MoVimento 5 Stelle",
  "Il Primato..." = 	"Il Primato Nazionale",
  "Il Fatto Quoti"="Il Fatto Quotidiano",
  "M. RenziNs"="Matteo Renzi News",
  "P. Democratico"="Partito Democratico",
  "Il manifesto"="il manifesto",
  "La Repubblica"="la Repubblica",
  "L.Borgonzoni"="Lucia Borgonzoni",
  "Adesso ti inf"="Adesso ti informo",
  "CasaPound"="CasaPound Italia",
  "Lotta Studt"="Lotta Studentesca",
  "Articolo UNO"="Articolo UNO - Movimento Democratico e Progressista"
))

pub_levels <- c( "Articolo UNO","Giuseppe Civati","Il manifesto","Laura Boldrini","Possibile","Sinistra Italiana",
                 "Adesso ti inf","Democratica","La Repubblica","Matteo Renzi","M. RenziNs","P. Democratico",
                 "Beppe Grillo","Il Fatto Quoti","Luigi Di Maio","M5S news","M5S","W IL M5S",
                 "Giorgia Meloni","Il Giornale","Il Populista","Lega Salvini","L.Borgonzoni","Noi con Salvini",
                 "CasaPound","Fascisti uniti","Forza Nuova","Il Primato...","Lotta Studt","Ordine Futuro","Roberto Fiore"
)

dataset$publisherName_re_ordered <- dataset$publisherName %>% fct_relevel("Articolo UNO","Giuseppe Civati","Il manifesto","Laura Boldrini","Possibile","Sinistra Italiana",
                 "Adesso ti inf","Democratica","La Repubblica","Matteo Renzi","M. RenziNs","P. Democratico",
                 "Beppe Grillo","Il Fatto Quoti","Luigi Di Maio","M5S news","M5S","W IL M5S",
                 "Giorgia Meloni","Il Giornale","Il Populista","Lega Salvini","L.Borgonzoni","Noi con Salvini",
                 "CasaPound","Fascisti uniti","Forza Nuova","Il Primato...","Lotta Studt","Ordine Futuro","Roberto Fiore") 

dataset_FB_API$publisherName_re_ordered <- dataset_FB_API$publisherName %>% fct_relevel("Articolo UNO","Giuseppe Civati","Il manifesto","Laura Boldrini","Possibile","Sinistra Italiana",
                 "Adesso ti inf","Democratica","La Repubblica","Matteo Renzi","M. RenziNs","P. Democratico",
                 "Beppe Grillo","Il Fatto Quoti","Luigi Di Maio","M5S news","M5S","W IL M5S",
                 "Giorgia Meloni","Il Giornale","Il Populista","Lega Salvini","L.Borgonzoni","Noi con Salvini",
                 "CasaPound","Fascisti uniti","Forza Nuova","Il Primato...","Lotta Studt","Ordine Futuro","Roberto Fiore") 

```


#Sanity Check


All users have more than 400 news feed snapshots
```{r}
snapshots <- dataset %>% group_by(profileAlign) %>% distinct(timelineId) %>% summarise(snapshots = n())
(ggplot(snapshots, aes(profileAlign,snapshots,fill=profileAlign))+geom_bar(stat="identity")
+labs(title="Número total de fotografias por usuário",x="Fonte", y="Amostras")
  +guides(fill=guide_legend(title="Orientação do usuário"))
)
ggsave("fotografias_por_bot.eps")
```



```{r}
impressions_per_snapshot <- dataset %>% group_by(profileAlign,timelineId) %>% summarise(impressions = n())
ggplot(impressions_per_snapshot, aes(impressions))+geom_histogram()

impressions_per_snapshot <- dataset %>% filter(impressionOrder==1) %>% group_by(profileAlign,timelineId) %>% summarise(impressions = n())
ggplot(impressions_per_snapshot, aes(impressions))+geom_histogram()


impressions_per_snapshot <- dataset %>% filter(impressionOrder<=10) %>% group_by(profileAlign,timelineId) %>% summarise(impressions = n())
ggplot(impressions_per_snapshot, aes(impressions))+geom_histogram()


impressions_per_snapshot <- dataset %>% filter(impressionOrder<=30) %>% group_by(profileAlign,timelineId) %>% summarise(impressions = n())
ggplot(impressions_per_snapshot, aes(impressions))+geom_histogram()



```

#Data Transformation and creation of a tidy dataset and statics



Create a tidy dataset, with a new collumn account for the slice of the timeline 
Create a tidy dataset, with a new collumn account for the slice of the timeline 
```{r creation of a tidydataset, message = FALSE}
topSelection <-  dataset %>% filter(impressionOrder==1) %>%  group_by(profileAlign,publisherName)  %>%  summarise (top_position=1, unique_posts=n_distinct(postId),views=n())
topSelection <- topSelection %>%  complete(publisherName, fill=list(top_position=1,unique_posts=0,views=0))
#complete(group, nesting(item_id, item_name))

presence <- dataset %>% filter(impressionOrder==1) %>% group_by(profileAlign,publisherName,timelineId) %>% tally()
#presence <- presence %>% complete(publisherName,fill=list(n=0))
presence <- presence  %>% group_by(profileAlign,publisherName) %>% summarize(presence=n())

#topSelection <- inner_join(topSelection,presence)
topSelection <- left_join(topSelection,presence)


TTL <- dataset %>% filter(impressionOrder==1) %>% group_by(publisherName,profileAlign,postId) %>% summarise(lifespan=max(visualizationDiff)) 
TTL <- TTL %>% group_by(publisherName,profileAlign) %>% summarise(top_position=1,total_lifespan=sum(lifespan)) 

for (i in 2:40 ){
  
tmp_loop <-  dataset %>% filter(impressionOrder<=i ) %>%  group_by(profileAlign,publisherName)  %>%  summarise (top_position=i,views=n(),unique_posts=n_distinct(postId))
tmp_loop <- tmp_loop %>%  complete(publisherName, fill=list(top_position=i,unique_posts=0,views=0))
presence <- dataset %>% filter(impressionOrder<=i) %>% group_by(profileAlign,publisherName,timelineId) %>% tally()
#presence <- presence %>% complete(publisherName,fill=list(n=0))
presence <- presence  %>% group_by(profileAlign,publisherName) %>% summarize(presence=n())

#tmp_loop <- inner_join(tmp_loop,presence)
tmp_loop <- left_join(tmp_loop,presence)

topSelection <- bind_rows(topSelection, tmp_loop)

TTL_loop <- dataset %>% filter(impressionOrder<=i ) %>% group_by(publisherName,profileAlign,postId) %>% summarise(lifespan=max(visualizationDiff)) 
TTL_loop <- TTL_loop %>% group_by(publisherName,profileAlign) %>% summarise(top_position=i,total_lifespan=sum(lifespan)) 
TTL <- bind_rows(TTL, TTL_loop)
}

```

FB Api Data
```{r}
#by publisher
source_posts_FB_API <- dataset_FB_API %>% group_by(publisherName,publisherOrientation) %>% distinct(postId) %>% summarise(created_posts = n())
total_posts <-  dataset_FB_API %>% distinct(postId) %>% summarize(total=n() )
source_posts_FB_API$total_unique_posts <- total_posts$total
#source_posts_FB_API <-  mutate(source_posts_FB_API,unfiltered_probability=top*created_posts / total_unique_posts )

#by orientation

posts_produced_by_orientation <- dataset_FB_API %>% group_by(publisherOrientation) %>% distinct(postId) %>% summarize(created_posts=n())
```


Create the results table
```{r}
results <-inner_join(topSelection, source_posts_FB_API)
results$top <- as.numeric(results$top_position)
results <-inner_join(results, snapshots)
results <- mutate(results,Occupancy=views / snapshots,
                  prop_Occupancy=Occupancy/top,
                  rate=unique_posts/snapshots)
```


Merge with FB API data
```{r}
#results <-inner_join(results, source_posts_FB_API)
```
```{r}
total_rate <- results %>% group_by(profileAlign,top_position) %>% summarize(total_rate=sum(rate))
results <-inner_join(results, total_rate)
```


Statistics with both sources of information

```{r}
results <- results %>% mutate(unfiltered_probability=top*created_posts / total_unique_posts )
results$presence <- results$presence %>%  replace_na(0)
results <- mutate(results,blocking_rate=(unique_posts)/(created_posts),
                  bias=Occupancy-unfiltered_probability,
                  prop_bias=bias/top,
                  rel_bias=(Occupancy-unfiltered_probability)/unfiltered_probability,
                  prop_bias=bias/top,
                  bloqued_posts=(created_posts-unique_posts)/snapshots,
                  model=top*rate/total_rate,
                  visibility=presence/snapshots,
                  visibilityModel=1-((total_rate-rate)/total_rate)^top
                  ) #normalized by
```


Grouped_by_orienation
```{r}
results_by_orientation <- results %>% group_by(profileAlign,publisherOrientation,top_position) %>% summarize(unique_posts=sum(unique_posts),views=sum(views),bias=sum(bias),Occupancy=sum(Occupancy),prop_Occupancy=sum(prop_Occupancy),total_unique_posts=max(total_unique_posts),rate=sum(rate),total_rate=sum(total_rate))
results_by_orientation$top <- as.numeric(results_by_orientation$top_position)
results_by_orientation <-inner_join(results_by_orientation,snapshots)
results_by_orientation <-inner_join(results_by_orientation,posts_produced_by_orientation)
results_by_orientation <- mutate(results_by_orientation,blocking_rate=created_posts/(views*snapshots),
                                 unfiltered_probability=top*created_posts / total_unique_posts,
                                 bias=Occupancy-unfiltered_probability,
                                 prop_bias=bias/top,
                                 model=top*rate/total_rate)
                                 


```



#Comparison between FB API and FBtrex data


FB API Data and Analysis. The figure below shows that Luigi di Maio is the publisher that produced more contents, followed by Il Giornale and Il Fatto Quotidiano and two sources related to Lega Salvini. La Repubblica appears in the 6th position. 



```{r}
(ggplot(source_posts_FB_API, aes(x=reorder(publisherName, -created_posts),y=created_posts,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(x="Fontes", y="Publicações")
 +guides(fill=guide_legend(title="Orientação da fonte"))
)
ggsave("publicacoes_por_fonte_API.eps")
```

Below is the total posts produced grouped by political orientation. The right sources produced more posts, followed closely by the 5 star movement sources.

```{r}
(ggplot(posts_produced_by_orientation, aes(x=publisherOrientation,y=created_posts,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 45, hjust = 1),legend.position="bottom")
 +labs(x="Orientação da fonte", y="Publicações")+guides(fill=guide_legend(title="Orientação do fonte"))
)
ggsave("publicacoes_por_orientaçao_API.eps")
```

The following plot shows the distribution of posts that appeared in any position of the bot's news feed. This figure contains all the posts collected by the experiment. It is possible to see that both plots differs. Il Giornale is the most viewed followed by La Repubblica.

```{r}
source_posts <- dataset %>% group_by(publisherName,publisherOrientation) %>% distinct(postId) %>% summarise(posts = n())
(ggplot(source_posts, aes(x=reorder(publisherName, -posts),y=posts,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(x="Fontes", y="Impressões")
  +guides(fill=guide_legend(title="Orientação do fonte"))
)
ggsave("publicacoes_por_fonte_fbtrex.eps")
```

The Figure below shows the distribution of posts that appeared in the top position of the bot's news feed. This figure differs even more of the first one. Now, La Reppublica is the most popular publisher, accounting for the three times the number posts of the Movimento 5 Stelle. The two publishers that created more content, Luigi di Maio and Il Giornale, doesn't appear in the top 5 positions.  


```{r}


(ggplot(filter(results,top_position=='1'), aes(x=reorder(publisherName, -views),y=views,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Número total de publicações por fontes visualizadas no top da news feed",x="Fonte", y="Publicações")
 +guides(fill=guide_legend(title="Orientação do fonte"))
)
ggsave("publicacoes_por_fonte_visualizados_no_topo.eps")

```


Grouped by political orientation, the difference becomes even clearer,  due to the high occupancy of La Repubblica, the center-left orientation is the more popular in top position, and the right orientation drops to the 3rd position.


```{r}


(ggplot(filter(results_by_orientation,top_position=='1'), aes(x=reorder(publisherOrientation, -views),y=views,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Número total de publicações por orientação política no top da News Feed",x="Fonte", y="Publicações")
 +guides(fill=guide_legend(title="Orientação do fonte"))
)
ggsave("publicacoes_por_fonte_orientacoes_no_topo.eps")

(ggplot(filter(results_by_orientation,top_position=='10'), aes(x=publisherOrientation, ,y=views,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 45, hjust = 1),legend.position="bottom")
 +labs(title="Número total de publicações por orientação política no top da News Feed",x="Fonte", y="Publicações")
 +guides(fill=guide_legend(title="Orientação do fonte"))
)
ggsave("publicacoes_por_fonte_orientacoes_no_top10.eps")
```


#Top-K analysis

```{r}

(ggplot(filter(results,top_position=='1'), aes(x=reorder(publisherName,-created_posts),y=prop_Occupancy,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom",axis.text = element_text( size=9, face="bold"))
 +labs(title="Ocupação por fonte no topo da timeline",x="Fonte", y="Ocupação")
)
ggsave("publicacoes_por_fonte_e user_no_topo.eps")

(ggplot(filter(results,top_position=='10' & Occupancy >0.2), aes(x=reorder(publisherName,-created_posts),y=views,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom",axis.text = element_text( size=8))
 +labs(x="Fonte", y="Impressões")+guides(fill=guide_legend(title="Orientação da Fonte"))
)
ggsave("publicacoes_por_fonte_e user_no_top10.eps")

(ggplot(filter(results,top_position=='30'), aes(x=reorder(publisherName,-created_posts),y=prop_Occupancy,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
+labs(title="Ocupação por fonte no 30 primeiras posições da timeline",x="Fonte", y="Ocupação")
)
ggsave("publicacoes_por_fonte_e user_no_top30.eps")
```





```{r}
(ggplot(filter(results_by_orientation,top==1), aes(x=publisherOrientation,y=views,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 45, hjust = 1),legend.position="bottom")
 + facet_wrap(~profileAlign)
 +labs(title="Número total de publicações vistas por orientação política por usuário",x="Orientação da fonte", y="Publicações")+guides(fill=guide_legend(title="Orientação do fonte"))
)
ggsave("publicacoes_por_orientaçao_por_usuario.eps")

(ggplot(filter(results_by_orientation,top==10), aes(x=publisherOrientation,y=views,fill=publisherOrientation)) +
    geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 45, hjust = 1),legend.position="bottom")
 + facet_wrap(~profileAlign)
 +labs(x="Orientação da fonte", y="Impressões")+guides(fill=guide_legend(title="Orientação do fonte"))
)
ggsave("publicacoes_por_orientaçao_por_usuario_top10.eps")
```







```{r}
(ggplot(results_by_orientation, aes(x=top_position,y=prop_Occupancy,fill=publisherOrientation)) +   geom_bar(stat="identity",position="fill")+ facet_wrap(~profileAlign)
 +labs(title="Ocupação proporcional por orientação e tamanho da timeline  ",x="Tamanho da timeline", y="Ocupação Proporcional")+ theme(legend.position="bottom")
)
ggsave("publicacoes_por_orientação_e_posicao.eps")
```



```{r}
(ggplot(filter(results,top_position=='1'), aes(x=reorder(publisherName,-created_posts),y=blocking_rate,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Fraction of posts views per posts creation",x="Publisher", y="Fraction of posts views per posts creation ")
)


(ggplot(filter(results,top_position=='10'), aes(x=reorder(publisherName,-created_posts),y=blocking_rate,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Fraction of posts views per posts creation",x="Publisher", y="Fraction of posts views per posts creation ")
)

ggsave("posts_vistos_sobre_criados_top10.eps")
```



```{r}
(ggplot(results_by_orientation, aes(x=publisherOrientation,y=blocking_rate,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Fraction of posts views per posts creation",x="Publisher", y="Fraction of posts views per posts creation ")
)

ggsave("posts_vistos_sobre_criados_top10_orientacao.eps")
```




```{r}
(ggplot(filter(results,top_position=='1'), aes(x=reorder(publisherName,-created_posts),y=bloqued_posts,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Bloqued at each bot",x="Publisher", y="Bloqued Posts")
)
```


```{r}
(ggplot(filter(results,top_position=='1'), aes(x=reorder(publisherName,-created_posts),y=bias,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Vies por usuário",x="Fonte", y="Viés")
)
ggsave("vies_por_fonte.eps")

(ggplot(filter(results,top_position=='10' & abs(prop_bias) >0.03), aes(x=reorder(publisherName,-created_posts),y=prop_bias,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Vies por usuário",x="Fonte", y="Viés")+guides(fill=guide_legend(title="Orientação do fonte"))
)


(ggplot(filter(results,top_position=='10' & abs(bias) >0.4), aes(x=reorder(publisherName,created_posts),y=bias,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 0, hjust = 1),legend.position="bottom")
 +labs(x="Fonte", y="Viés")+guides(fill=guide_legend(title="Orientação do fonte"))
  +coord_flip()
)

ggsave("vies_por_fonte_top10.eps")

(ggplot(filter(results,top_position=='30'), aes(x=reorder(publisherName,-created_posts),y=prop_bias,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 0, hjust = 1),legend.position="bottom")
 +labs(title="Vies por usuário",x="Fonte", y="Viés")
)
ggsave("vies_por_fonte_top30.eps")
```

```{r}
(ggplot(filter(results,top_position=='1'), aes(x=reorder(publisherName,-created_posts),y=rel_bias,fill=publisherOrientation))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 90, hjust = 1),legend.position="bottom")
 +labs(title="Relative bias at each bot",x="Publisher", y="Bias")
)
```








```{r}
(ggplot(filter(results_by_orientation,top_position=='1'), aes(x=profileAlign,y=blocking_rate,fill=publisherOrientation,label=blocking_rate %>% round(1)))  
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 45, hjust = 1))
 +geom_text(size = 3, position = position_stack(vjust = 0.5))
 +labs(title="Blocking rate per snapshot",x="Publisher", y="Posts Blocked")
)
```




```{r}
(ggplot(filter(results_by_orientation,top_position=='1'), aes(x=reorder(publisherOrientation,-unique_posts),y=Occupancy,fill=publisherOrientation))  +theme_bw()+ facet_wrap(~profileAlign)
    +geom_bar(stat="identity") + theme(axis.text.x = element_text(angle = 45, hjust = 1))
 +labs(title="Orientation Occupancy on the top at each bot",x="Publisher", y="Posts
  Published")
 
)
```

```{r}
(ggplot(filter(results_by_orientation,top_position=='1'), aes(x=publisherOrientation,y=bias,fill=bias))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity",colour="gray") + theme(axis.text.x = element_text(angle = 90, hjust = 1))
 +labs(title="Orientation Bias on the top at each bot",x="Publisher", y="Posts
  Published")+coord_flip() +scale_fill_gradient2(low="red",high="green")
 +theme_bw()
)

(ggplot(filter(results_by_orientation,top_position=='10'), aes(x=publisherOrientation,y=bias,fill=bias))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity",colour="gray") + theme(axis.text.x = element_text(angle = 90, hjust = 1))
 +labs(x="Orientação", y="Publicações")+coord_flip() +scale_fill_gradient2(low="red",high="green")
 +theme_bw()+guides(fill=guide_legend(title="Viés"))
)

ggsave("vies_por_orientacao_top10.eps")

(ggplot(filter(results_by_orientation,top_position=='30'), aes(x=publisherOrientation,y=bias,fill=bias))  + facet_wrap(~profileAlign)
    +geom_bar(stat="identity",colour="gray") + theme(axis.text.x = element_text(angle = 90, hjust = 1))
 +labs(title="Orientation Bias on the top-30 at each bot",x="Publisher", y="Posts
  Published")+coord_flip() +scale_fill_gradient2(low="red",high="green")
 +theme_bw()+guides(fill=guide_legend(title="Viés"))
)
```


#Bootstraping functions

```{r}

diff_bootstrap <- function(vec1,vec2,samples,repetitions,top){
  # this function calculates the diference of the bootstrap of two vectors
  bots <- unique(factor(dataset$profileAlign)) # create a categorical factor do be used by seq_along
  botsList <- as_tibble(unique(dataset$profileAlign)) # create a list to be used by the filter   
  
  Fb_API_resample <- stats(vec2$publisherName,repetitions,samples)
  Fb_API_resample <- rename(Fb_API_resample,viewsApi=views)
                                                  
  resampled=as_tibble()
  
  for (i in seq_along(bots)) {
    data <- filter(dataset,profileAlign==botsList[[i,1]] & impressionOrder==top)
    tmp <- stats(data$publisherName,repetitions,samples)
    tmp <- full_join(Fb_API_resample,tmp) 
   #samtmp3 
    tmp <- add_column(tmp, profileAlign = botsList[[i,1]])
    resampled <- bind_rows(resampled,tmp)
    resampled$views <- replace_na(resampled$views,0)
    resampled$viewsApi <- replace_na(resampled$viewsApi,0)
  } 
  
  resampled <- resampled %>% mutate(bias=(resampled$views-resampled$viewsApi)/samples)
  resampled  <- rename(resampled,sample=key,publisherName=value)
  # spread the dataset to assure values in all samples
  tmp <- resampled %>% select(publisherName,sample,bias,profileAlign)
  tmp <- spread(tmp,key=publisherName,value=bias)
  tmp <- tmp %>% select(-sample)
  resampled <- tmp %>% gather(-profileAlign,key=publisherName,value=bias)
  resampled$bias <- resampled$bias %>% replace_na(0)
  return(resampled)
}


# The random variable that accounts fort the topmost position is binary. Therefore we need generate means of means to make the variable continuous. 
stats <- function(x,repetitions,samples){
  tmp <- replicate(repetitions, sample(x,samples, replace = TRUE)) %>% tidy
  tmp <- gather(tmp)  %>% group_by(key,value) %>% summarise(views=n())
}

#Retuns the confidence itervals to be plotted
diff_bootstrap_CI <- function(resampled,vec,confidence){
#results, where the intervals should be calculated
# vec, needed by ordenate the bias plot by the number of posts created  
up <- (1-confidence)/2+confidence
low <- (1-confidence)/2
resampling_summary <- resampled %>% group_by(profileAlign,publisherName) %>%
    summarise(low=quantile(bias, probs=low),
              median=quantile(bias, probs=0.5),
              high=quantile(bias, probs=up),
              bias=mean(bias),
              total=n()
              )
   publishers <- vec %>% group_by(publisherName,publisherOrientation) %>% summarize(createdPosts=n())
   resampling_summary <- inner_join(resampling_summary,publishers)
   return(resampling_summary)
}

diff_bootstrap_CI_orientation <- function(resampled,vec,confidence){
#results, where the intervals should be calculated
# vec, needed by ordenate the bias plot by the number of posts created  
up <- (1-confidence)/2+confidence
low <- (1-confidence)/2
publishers <- vec %>% group_by(publisherName,publisherOrientation) %>% tally()
resampled<- inner_join(resampled,publishers)
resampling_summary <- resampled %>% group_by(profileAlign,publisherOrientation) %>%
    summarise(low=quantile(bias, probs=low),
              median=quantile(bias, probs=0.5),
              high=quantile(bias, probs=up),
              bias=mean(bias),
              total=n()
              )
   orientations <- vec %>% group_by(publisherOrientation) %>% summarize(createdPosts=n())
   resampling_summary <- inner_join(resampling_summary,orientations)
   return(resampling_summary)
}

```   

```{r}
(ggplot(filter(results,top==10), aes(y=Occupancy, x=model)) +
    geom_point()+labs(x='Modelo (Ocupação)', y='Medições (Ocupação)')
 + geom_line(aes(x=Occupancy,y=Occupancy))+theme_bw()
  + theme(axis.text = element_text( size=17, face="bold"),axis.title=element_text(size=17,face="bold"))
)
ggsave("validacao.eps")

tmp <- filter(results,top==10)
rmse(tmp$model, tmp$Occupancy)

(ggplot(filter(results,top==10), aes(y=visibility, x=visibilityModel)) +
    geom_point()+labs(x='Modelo (Visibilidade)', y='Medições (Visibilidade)')
 + geom_line(aes(x=visibility,y=visibility))+theme_bw()
   + theme(axis.text = element_text( size=17, face="bold"),axis.title=element_text(size=17, face="bold"))
)
ggsave("validacaoVisibility.eps")

tmp <- filter(results,top==10)
rmse(tmp$visibilityModel, tmp$visibility)
```

