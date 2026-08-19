-- =========================================================
-- MIRROR 자동 생성 / 갱신
--
-- 친구 응답 3개 미만:
--   MIRROR 생성 안 함
--
-- 친구 응답 3개 이상:
--   전체 친구 응답의 6가지 성향 평균을 계산
--   MIRROR가 없으면 INSERT
--   MIRROR가 있으면 UPDATE
--
-- 추후 AI 도입 시 이 평균 계산 로직을 AI 분석으로 교체 예정
-- =========================================================


-- 1. 특정 설문의 전체 친구 응답을 이용해
--    MIRROR persona를 생성 또는 갱신한다.
create or replace function public.refresh_mirror_persona(
  p_survey_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_response_count integer;

  v_scores jsonb;

  v_strongest_trait text;
  v_strongest_label text;

  v_title text;
begin

  -- 설문 주인 찾기
  select user_id
  into v_user_id
  from public.friend_surveys
  where id = p_survey_id;


  if v_user_id is null then
    return;
  end if;


  -- 실제 저장된 응답 개수 확인
  select count(*)
  into v_response_count
  from public.friend_responses
  where survey_id = p_survey_id;


  -- 친구 3명 미만이면 MIRROR를 아직 만들지 않는다.
  if v_response_count < 3 then
    return;
  end if;


  -- =====================================================
  -- 전체 친구 응답에서 6가지 성향 평균 계산
  -- =====================================================

  with trait_values as (
    select
      item ->> 'trait' as trait,
      (item ->> 'value')::numeric as value

    from public.friend_responses fr

    cross join lateral
      jsonb_array_elements(fr.answers -> 'items') as item

    where fr.survey_id = p_survey_id
      and item ? 'trait'
      and item ? 'value'
  ),

  averages as (
    select
      trait,
      round(avg(value))::integer as score

    from trait_values

    where trait in (
      'socialEnergy',
      'expression',
      'initiative',
      'empathy',
      'stability',
      'execution'
    )

    group by trait
  )

  select

    jsonb_build_object(

      'socialEnergy',
      coalesce(
        max(score)
        filter (where trait = 'socialEnergy'),
        50
      ),

      'expression',
      coalesce(
        max(score)
        filter (where trait = 'expression'),
        50
      ),

      'initiative',
      coalesce(
        max(score)
        filter (where trait = 'initiative'),
        50
      ),

      'empathy',
      coalesce(
        max(score)
        filter (where trait = 'empathy'),
        50
      ),

      'stability',
      coalesce(
        max(score)
        filter (where trait = 'stability'),
        50
      ),

      'execution',
      coalesce(
        max(score)
        filter (where trait = 'execution'),
        50
      )

    ),

    (
      select trait
      from averages
      order by score desc, trait
      limit 1
    )

  into
    v_scores,
    v_strongest_trait

  from averages;


  -- =====================================================
  -- 가장 높은 성향에 따라 현재 임시 MIRROR 이름 생성
  -- 나중에 AI가 title / summary도 생성하게 교체 예정
  -- =====================================================

  v_strongest_label :=
    case v_strongest_trait

      when 'socialEnergy'
        then '관계 에너지'

      when 'expression'
        then '감정 표현'

      when 'initiative'
        then '주도성'

      when 'empathy'
        then '공감성'

      when 'stability'
        then '안정성'

      when 'execution'
        then '실행력'

      else
        '타인의 시선'

    end;


  v_title :=
    case v_strongest_trait

      when 'socialEnergy'
        then '사람 사이를 연결하는 연결자'

      when 'expression'
        then '마음을 솔직하게 전하는 표현가'

      when 'initiative'
        then '먼저 움직이는 추진자'

      when 'empathy'
        then '주변을 편하게 만드는 조력자'

      when 'stability'
        then '차분함을 지키는 균형자'

      when 'execution'
        then '끝까지 해내는 실행가'

      else
        '친구들이 발견한 또 다른 나'

    end;


  -- =====================================================
  -- MIRROR 최초 생성 또는 기존 MIRROR 갱신
  -- =====================================================

  insert into public.personas (
    user_id,
    type,
    title,
    summary,
    keywords,
    scores
  )

  values (
    v_user_id,

    'MIRROR',

    v_title,

    '친구들의 응답을 모아 타인의 시선에서 다시 구성한 현재의 나입니다.',

    array[
      v_strongest_label,
      '친구 응답 기반',
      '타인의 시선'
    ]::text[],

    v_scores
  )

  on conflict (user_id, type)

  do update set

    title = excluded.title,

    summary = excluded.summary,

    keywords = excluded.keywords,

    scores = excluded.scores;

end;
$$;



-- =========================================================
-- 2. 기존 응답 카운터 Trigger 함수에
--    MIRROR 갱신 기능 연결
-- =========================================================

create or replace function public.increment_friend_survey_response_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  update public.friend_surveys

  set response_count = response_count + 1

  where id = new.survey_id;


  -- 친구 응답이 들어올 때마다 MIRROR 다시 계산
  perform public.refresh_mirror_persona(
    new.survey_id
  );


  return new;

end;
$$;



-- =========================================================
-- 3. 실제 응답 개수와 response_count를 다시 동기화
-- =========================================================

update public.friend_surveys fs

set response_count = (

  select count(*)

  from public.friend_responses fr

  where fr.survey_id = fs.id

);



-- =========================================================
-- 4. 이미 3개 이상 응답이 있는 기존 설문도
--    즉시 MIRROR 생성
--
-- 현재 네 3/3 설문 때문에 필요한 부분
-- =========================================================

do $$
declare
  survey_record record;
begin

  for survey_record in

    select fs.id

    from public.friend_surveys fs

    where (
      select count(*)

      from public.friend_responses fr

      where fr.survey_id = fs.id
    ) >= 3

  loop

    perform public.refresh_mirror_persona(
      survey_record.id
    );

  end loop;

end;
$$;