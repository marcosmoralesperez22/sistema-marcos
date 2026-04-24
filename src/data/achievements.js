// =============================================
// ACHIEVEMENTS — Definitions & progress checker
// =============================================

import { store } from './store.js';
import { showToast } from '../components/toast.js';

// === CATALOGO DE LOGROS 2026 (Hasta Semana Santa) ===
export const ACHIEVEMENT_DEFS = [
    // --- REDES SOCIALES (YouTube/TikTok/Instagram) ---
    // Producción (vídeos)
    { id: 'yt_prod_1', name: 'Primer paso', category: 'youtube', subcategory: 'Producción', emoji: 'movie', tier: 1, description: 'Publicar 1 vídeo.', requirement: { type: 'manual', count: 1 } },
    { id: 'yt_prod_3', name: 'Arranque', category: 'youtube', subcategory: 'Producción', emoji: 'movie', tier: 1, description: '3 vídeos publicados.', requirement: { type: 'manual', count: 3 } },
    { id: 'yt_prod_5', name: 'Constancia 1', category: 'youtube', subcategory: 'Producción', emoji: 'movie', tier: 2, description: '5 vídeos publicados.', requirement: { type: 'manual', count: 5 } },
    { id: 'yt_prod_10', name: 'Serie 10', category: 'youtube', subcategory: 'Producción', emoji: 'local_fire_department', tier: 2, description: '10 vídeos publicados.', requirement: { type: 'manual', count: 10 } },
    { id: 'yt_prod_15', name: 'Serie 15', category: 'youtube', subcategory: 'Producción', emoji: 'local_fire_department', tier: 3, description: '15 vídeos publicados.', requirement: { type: 'manual', count: 15 } },
    { id: 'yt_prod_20', name: 'Serie 20', category: 'youtube', subcategory: 'Producción', emoji: 'emoji_events', tier: 3, description: '20 vídeos publicados.', requirement: { type: 'manual', count: 20 } },
    { id: 'yt_prod_30', name: 'Maratón', category: 'youtube', subcategory: 'Producción', emoji: 'workspace_premium', tier: 4, description: '30 vídeos publicados.', requirement: { type: 'manual', count: 30 } },
    { id: 'yt_prod_w_2', name: 'Semana en llamas', category: 'youtube', subcategory: 'Producción', emoji: 'whatshot', tier: 2, description: '2 vídeos en 7 días.', requirement: { type: 'manual', count: 1 } },
    { id: 'yt_prod_w_3', name: 'Semana doble', category: 'youtube', subcategory: 'Producción', emoji: 'whatshot', tier: 3, description: '3 vídeos en 7 días.', requirement: { type: 'manual', count: 1 } },
    { id: 'yt_prod_noex', name: 'No excuses', category: 'youtube', subcategory: 'Producción', emoji: 'check_circle', tier: 1, description: '1 vídeo publicado (sin edición avanzada).', requirement: { type: 'manual', count: 1 } },

    // Guiones y hablar
    { id: 'yt_scr_3', name: 'Guionista aprendiz', category: 'youtube', subcategory: 'Guiones', emoji: 'edit', tier: 1, description: '3 guiones escritos (aunque no grabes).', requirement: { type: 'manual', count: 3 } },
    { id: 'yt_scr_10', name: 'Guionista sólido', category: 'youtube', subcategory: 'Guiones', emoji: 'edit_document', tier: 2, description: '10 guiones escritos.', requirement: { type: 'manual', count: 10 } },
    { id: 'yt_hook_1', name: 'Hook master I', category: 'youtube', subcategory: 'Guiones', emoji: 'phishing', tier: 2, description: '10 intros con gancho (primeros 10-15s).', requirement: { type: 'manual', count: 10 } },
    { id: 'yt_hook_2', name: 'Hook master II', category: 'youtube', subcategory: 'Guiones', emoji: 'phishing', tier: 3, description: '20 intros mejoradas.', requirement: { type: 'manual', count: 20 } },
    { id: 'yt_voice_5', name: 'Voz clara', category: 'youtube', subcategory: 'Guiones', emoji: 'mic', tier: 1, description: 'Grabar 5 tomas cuidando dicción/ritmo.', requirement: { type: 'manual', count: 5 } },
    { id: 'yt_nat_10', name: 'Naturalidad', category: 'youtube', subcategory: 'Guiones', emoji: 'sentiment_satisfied', tier: 2, description: '10 vídeos con buen tono sin forzar.', requirement: { type: 'manual', count: 10 } },
    { id: 'yt_story_5', name: 'Storytelling', category: 'youtube', subcategory: 'Guiones', emoji: 'auto_stories', tier: 2, description: '5 vídeos con estructura problema-proceso-resultado.', requirement: { type: 'manual', count: 5 } },

    // Calidad (Photoshop/Premiere)
    { id: 'yt_thumb_3', name: 'Editor básico', category: 'youtube', subcategory: 'Calidad', emoji: 'image', tier: 1, description: '3 miniaturas con plantilla consistente.', requirement: { type: 'manual', count: 3 } },
    { id: 'yt_thumb_10', name: 'Identidad visual I', category: 'youtube', subcategory: 'Calidad', emoji: 'brush', tier: 2, description: '10 miniaturas con estilo uniforme.', requirement: { type: 'manual', count: 10 } },
    { id: 'yt_thumb_20', name: 'Identidad visual II', category: 'youtube', subcategory: 'Calidad', emoji: 'palette', tier: 3, description: '20 miniaturas con estilo uniforme.', requirement: { type: 'manual', count: 20 } },
    { id: 'yt_edit_clean_5', name: 'Edición limpia', category: 'youtube', subcategory: 'Calidad', emoji: 'content_cut', tier: 2, description: '5 vídeos sin silencios largos.', requirement: { type: 'manual', count: 5 } },
    { id: 'yt_edit_rhythm_10', name: 'Edición con ritmo', category: 'youtube', subcategory: 'Calidad', emoji: 'speed', tier: 3, description: '10 vídeos con ritmo y B-roll.', requirement: { type: 'manual', count: 10 } },
    { id: 'yt_audio_5', name: 'Audio decente', category: 'youtube', subcategory: 'Calidad', emoji: 'volume_up', tier: 1, description: '5 vídeos con audio ajustado.', requirement: { type: 'manual', count: 5 } },
    { id: 'yt_best_effort', name: 'Subida de nivel', category: 'youtube', subcategory: 'Calidad', emoji: 'star', tier: 4, description: '1 vídeo "best effort".', requirement: { type: 'manual', count: 1 } },

    // Distribución
    { id: 'dist_tiktok', name: 'Apertura social', category: 'youtube', subcategory: 'Distribución', emoji: 'explore', tier: 1, description: 'Crear TikTok.', requirement: { type: 'manual', count: 1 } },
    { id: 'dist_ig', name: 'Apertura social 2', category: 'youtube', subcategory: 'Distribución', emoji: 'photo_camera', tier: 1, description: 'Crear Instagram.', requirement: { type: 'manual', count: 1 } },
    { id: 'dist_clip_1', name: 'Primer clip', category: 'youtube', subcategory: 'Distribución', emoji: 'play_arrow', tier: 1, description: 'Subir 1 short/reel.', requirement: { type: 'manual', count: 1 } },
    { id: 'dist_clip_3', name: 'Cadencia 3', category: 'youtube', subcategory: 'Distribución', emoji: 'playlist_play', tier: 2, description: 'Subir 3 clips.', requirement: { type: 'manual', count: 3 } },
    { id: 'dist_clip_7', name: 'Cadencia 7', category: 'youtube', subcategory: 'Distribución', emoji: 'dynamic_feed', tier: 3, description: 'Subir 7 clips.', requirement: { type: 'manual', count: 7 } },
    { id: 'dist_reap_5', name: 'Reaprovechador', category: 'youtube', subcategory: 'Distribución', emoji: 'recycling', tier: 2, description: '5 clips sacados de vídeos largos.', requirement: { type: 'manual', count: 5 } },
    { id: 'dist_cross_10', name: 'Crosspost', category: 'youtube', subcategory: 'Distribución', emoji: 'share', tier: 3, description: '10 publicaciones cruzadas.', requirement: { type: 'manual', count: 10 } },

    // Tracción
    { id: 'trac_sub_10', name: 'Primeros 10', category: 'youtube', subcategory: 'Tracción', emoji: 'group', tier: 1, description: '10 suscriptores.', requirement: { type: 'manual', count: 10 } },
    { id: 'trac_sub_25', name: 'Primeros 25', category: 'youtube', subcategory: 'Tracción', emoji: 'group_add', tier: 2, description: '25 suscriptores.', requirement: { type: 'manual', count: 25 } },
    { id: 'trac_sub_50', name: 'Meta 50', category: 'youtube', subcategory: 'Tracción', emoji: 'groups', tier: 3, description: '50 suscriptores.', requirement: { type: 'manual', count: 50 } },
    { id: 'trac_sub_100', name: 'Rumbo 100', category: 'youtube', subcategory: 'Tracción', emoji: 'celebration', tier: 4, description: '100 suscriptores.', requirement: { type: 'manual', count: 100 } },
    { id: 'trac_vis_1k', name: 'Primeras 1000', category: 'youtube', subcategory: 'Tracción', emoji: 'visibility', tier: 2, description: '1.000 visitas totales.', requirement: { type: 'manual', count: 1000 } },
    { id: 'trac_vis_10k', name: 'Meta 10.000', category: 'youtube', subcategory: 'Tracción', emoji: 'trending_up', tier: 4, description: '10.000 visitas totales.', requirement: { type: 'manual', count: 10000 } },
    { id: 'trac_com_1', name: 'Primer comentario', category: 'youtube', subcategory: 'Tracción', emoji: 'chat', tier: 1, description: '1 comentario en un vídeo.', requirement: { type: 'manual', count: 1 } },
    { id: 'trac_com_10', name: 'Conversación', category: 'youtube', subcategory: 'Tracción', emoji: 'forum', tier: 2, description: '10 comentarios totales.', requirement: { type: 'manual', count: 10 } },
    { id: 'trac_com_resp_10', name: 'Comunidad', category: 'youtube', subcategory: 'Tracción', emoji: 'question_answer', tier: 3, description: 'Responder a 10 comentarios.', requirement: { type: 'manual', count: 10 } },

    // Sistema y nicho
    { id: 'niche_radar_10', name: 'Radar de nicho', category: 'youtube', subcategory: 'Sistema y Nicho', emoji: 'radar', tier: 2, description: 'Escribir 10 ideas de vídeos.', requirement: { type: 'manual', count: 10 } },
    { id: 'niche_bank_30', name: 'Banco de ideas', category: 'youtube', subcategory: 'Sistema y Nicho', emoji: 'account_balance', tier: 3, description: '30 ideas guardadas.', requirement: { type: 'manual', count: 30 } },
    { id: 'niche_invest_10', name: 'Investigación', category: 'youtube', subcategory: 'Sistema y Nicho', emoji: 'search', tier: 2, description: '10 competidores analizados.', requirement: { type: 'manual', count: 10 } },
    { id: 'niche_system', name: 'Sistema creator', category: 'youtube', subcategory: 'Sistema y Nicho', emoji: 'settings_suggest', tier: 3, description: 'Plantillas y checklist creados.', requirement: { type: 'manual', count: 1 } },
    { id: 'niche_enjoy_7', name: 'Disfruto el nicho', category: 'youtube', subcategory: 'Sistema y Nicho', emoji: 'favorite', tier: 2, description: '7 días seguidos con ganas de crear.', requirement: { type: 'manual', count: 7 } },
    { id: 'niche_val_1', name: 'Validación cercana', category: 'youtube', subcategory: 'Sistema y Nicho', emoji: 'thumb_up', tier: 1, description: '1 persona cercana le gusta un vídeo.', requirement: { type: 'manual', count: 1 } },
    { id: 'niche_val_3', name: 'Validación x3', category: 'youtube', subcategory: 'Sistema y Nicho', emoji: 'recommend', tier: 3, description: '3 personas cercanas te lo dicen (en semanas distintas).', requirement: { type: 'manual', count: 3 } },


    // --- APRENDIZAJE ---
    // Universalidad
    { id: 'uni_warmup_5', name: 'Calentamiento', category: 'aprendizaje', subcategory: 'Universidad', emoji: 'school', tier: 1, description: '5 sesiones de uni (45-60 min).', requirement: { type: 'manual', count: 5 } },
    { id: 'uni_week_1', name: 'Semana al día I', category: 'aprendizaje', subcategory: 'Universidad', emoji: 'event_available', tier: 2, description: '5/7 días estudiando 2h.', requirement: { type: 'manual', count: 1 } },
    { id: 'uni_week_2', name: 'Semana al día II', category: 'aprendizaje', subcategory: 'Universidad', emoji: 'event_available', tier: 3, description: '6/7 días estudiando 2h.', requirement: { type: 'manual', count: 1 } },
    { id: 'uni_week_perf', name: 'Semana perfecta', category: 'aprendizaje', subcategory: 'Universidad', emoji: 'event_note', tier: 4, description: '7/7 días estudiando 2h.', requirement: { type: 'manual', count: 1 } },
    { id: 'uni_no_drag_1', name: 'Sin arrastre', category: 'aprendizaje', subcategory: 'Universidad', emoji: 'check_box', tier: 3, description: '1 semana sin acumular tareas.', requirement: { type: 'manual', count: 1 } },
    { id: 'uni_exam_ready_3', name: 'Examen-ready', category: 'aprendizaje', subcategory: 'Universidad', emoji: 'fact_check', tier: 3, description: '3 simulacros/colecciones.', requirement: { type: 'manual', count: 3 } },
    { id: 'uni_pass_arq', name: 'Arquitectura Aprobada', category: 'aprendizaje', subcategory: 'Universidad', emoji: 'workspace_premium', tier: 4, description: '¡Asignatura superada!', requirement: { type: 'manual', count: 1 } },

    // Kaizen
    { id: 'kaizen_1', name: 'Skill semanal 1', category: 'aprendizaje', subcategory: 'Kaizen', emoji: 'trending_up', tier: 1, description: 'Aprender 1 mejora aplicable.', requirement: { type: 'manual', count: 1 } },
    { id: 'kaizen_3', name: 'Skill semanal 3', category: 'aprendizaje', subcategory: 'Kaizen', emoji: 'trending_up', tier: 2, description: '3 semanas con 1 mejora/semana.', requirement: { type: 'manual', count: 3 } },
    { id: 'kaizen_5', name: 'Skill semanal 5', category: 'aprendizaje', subcategory: 'Kaizen', emoji: 'trending_up', tier: 3, description: '5 semanas con 1 mejora/semana.', requirement: { type: 'manual', count: 5 } },
    { id: 'kaizen_evidence', name: 'Antes y después', category: 'aprendizaje', subcategory: 'Kaizen', emoji: 'compare', tier: 2, description: '1 evidencia de progreso documentada.', requirement: { type: 'manual', count: 1 } },

    // Chino
    { id: 'lang_zh_1', name: 'Chino: Primer día', category: 'aprendizaje', subcategory: 'Chino', emoji: 'translate', tier: 1, description: '1 sesión de chino.', requirement: { type: 'manual', count: 1 } },
    { id: 'lang_zh_5', name: 'Chino constante', category: 'aprendizaje', subcategory: 'Chino', emoji: 'language', tier: 2, description: '5 sesiones de chino.', requirement: { type: 'manual', count: 5 } },
    { id: 'lang_zh_sec1', name: 'Sección 1 completada', category: 'aprendizaje', subcategory: 'Chino', emoji: 'done_all', tier: 2, description: 'Terminar sección 1.', requirement: { type: 'manual', count: 1 } },
    { id: 'lang_zh_sec1_pro', name: 'Sección 1 dominada', category: 'aprendizaje', subcategory: 'Chino', emoji: 'psychology', tier: 3, description: 'Repaso extra 3 días.', requirement: { type: 'manual', count: 3 } },
    { id: 'lang_zh_sec2', name: 'Sección 2 completada', category: 'aprendizaje', subcategory: 'Chino', emoji: 'done_all', tier: 3, description: 'Terminar sección 2.', requirement: { type: 'manual', count: 1 } },
    { id: 'lang_streak_7', name: 'Racha idioma', category: 'aprendizaje', subcategory: 'Inglés', emoji: 'local_fire_department', tier: 2, description: '7 días seguidos (10-20 min).', requirement: { type: 'manual', count: 7 } },
    { id: 'lang_double_3', name: 'Doble idioma', category: 'aprendizaje', subcategory: 'Inglés', emoji: 'forum', tier: 3, description: '3 días en la semana (chino + inglés).', requirement: { type: 'manual', count: 3 } },

    // Inglés
    { id: 'lang_en_reset_3', name: 'Reinicio', category: 'aprendizaje', subcategory: 'Inglés', emoji: 'record_voice_over', tier: 1, description: '3 sesiones de inglés.', requirement: { type: 'manual', count: 3 } },
    { id: 'lang_en_speak_1', name: 'Speaking I', category: 'aprendizaje', subcategory: 'Inglés', emoji: 'mic', tier: 2, description: '3 días hablando 5-10 min.', requirement: { type: 'manual', count: 3 } },
    { id: 'lang_en_speak_2', name: 'Speaking II', category: 'aprendizaje', subcategory: 'Inglés', emoji: 'mic_external_on', tier: 3, description: '7 días hablando 5-10 min.', requirement: { type: 'manual', count: 7 } },
    { id: 'lang_en_vocab_200', name: 'Vocabulario', category: 'aprendizaje', subcategory: 'Inglés', emoji: 'menu_book', tier: 4, description: '200 palabras/frases registradas.', requirement: { type: 'manual', count: 200 } },
    { id: 'lang_en_consume_5', name: 'Consumo útil', category: 'aprendizaje', subcategory: 'Inglés', emoji: 'smart_display', tier: 2, description: '5 vídeos/podcasts con notas.', requirement: { type: 'manual', count: 5 } },

    // IA + Diseño + Negocios
    { id: 'ia_base_10', name: 'IA base', category: 'aprendizaje', subcategory: 'IA y Negocios', emoji: 'memory', tier: 1, description: '10 conceptos clave apuntados.', requirement: { type: 'manual', count: 10 } },
    { id: 'ia_app_1', name: 'IA aplicada', category: 'aprendizaje', subcategory: 'IA y Negocios', emoji: 'robot', tier: 3, description: '1 mini-proyecto demo.', requirement: { type: 'manual', count: 1 } },
    { id: 'design_rep_3', name: 'Diseño I', category: 'aprendizaje', subcategory: 'IA y Negocios', emoji: 'design_services', tier: 2, description: 'Replicar 3 diseños.', requirement: { type: 'manual', count: 3 } },
    { id: 'design_own_10', name: 'Diseño II', category: 'aprendizaje', subcategory: 'IA y Negocios', emoji: 'draw', tier: 3, description: '10 pantallas/componentes propios.', requirement: { type: 'manual', count: 10 } },
    { id: 'biz_ideas_10', name: 'Negocios I', category: 'aprendizaje', subcategory: 'IA y Negocios', emoji: 'lightbulb', tier: 2, description: '10 ideas de oferta/servicio.', requirement: { type: 'manual', count: 10 } },
    { id: 'biz_analysis_3', name: 'Negocios II', category: 'aprendizaje', subcategory: 'IA y Negocios', emoji: 'analytics', tier: 3, description: '3 mini-análisis de empresas.', requirement: { type: 'manual', count: 3 } },
    { id: 'passion_10', name: 'Encuentro mi pasión', category: 'aprendizaje', subcategory: 'IA y Negocios', emoji: 'explore', tier: 4, description: '10 entradas y 1 conclusión.', requirement: { type: 'manual', count: 10 } },

    // Captura de conocimiento
    { id: 'notes_first_1', name: 'Primer resumen', category: 'aprendizaje', subcategory: 'Conocimiento y Carrera', emoji: 'note_add', tier: 1, description: '1 nota útil con bullets.', requirement: { type: 'manual', count: 1 } },
    { id: 'notes_lib_10', name: 'Biblioteca I', category: 'aprendizaje', subcategory: 'Conocimiento y Carrera', emoji: 'library_books', tier: 2, description: '10 notas de libros/posts.', requirement: { type: 'manual', count: 10 } },
    { id: 'notes_lib_25', name: 'Biblioteca II', category: 'aprendizaje', subcategory: 'Conocimiento y Carrera', emoji: 'local_library', tier: 3, description: '25 notas de libros/posts.', requirement: { type: 'manual', count: 25 } },
    { id: 'notes_recycle_5', name: 'Reciclaje', category: 'aprendizaje', subcategory: 'Conocimiento y Carrera', emoji: 'recycling', tier: 2, description: 'Unir 5 notas para proyectos.', requirement: { type: 'manual', count: 5 } },
    { id: 'linkedin_3', name: 'LinkedIn mejora', category: 'aprendizaje', subcategory: 'Conocimiento y Carrera', emoji: 'connect_without_contact', tier: 2, description: 'Perfil + 3 posts.', requirement: { type: 'manual', count: 3 } },
    { id: 'linkedin_6', name: 'LinkedIn ritmo', category: 'aprendizaje', subcategory: 'Conocimiento y Carrera', emoji: 'share', tier: 3, description: '6 posts antes de Semana Santa.', requirement: { type: 'manual', count: 6 } },
    { id: 'cv_5', name: 'Prácticas', category: 'aprendizaje', subcategory: 'Conocimiento y Carrera', emoji: 'work', tier: 3, description: 'CV actualizado + 5 candidaturas.', requirement: { type: 'manual', count: 5 } },


    // --- ECONOMÍA Y RELACIONES ---
    { id: 'eco_track_7', name: 'Base financiera', category: 'economia_familia', subcategory: 'Economía', emoji: 'account_balance_wallet', tier: 1, description: 'Registrar gastos 7 días seguidos.', requirement: { type: 'manual', count: 7 } },
    { id: 'eco_no_temu_7', name: 'Semana sin Temu', category: 'economia_familia', subcategory: 'Economía', emoji: 'remove_shopping_cart', tier: 2, description: '7 días sin comprar en Temu.', requirement: { type: 'manual', count: 7 } },
    { id: 'eco_no_sushi_7', name: 'Semana sin sushi', category: 'economia_familia', subcategory: 'Economía', emoji: 'restaurant_menu', tier: 2, description: '7 días sin sushi.', requirement: { type: 'manual', count: 7 } },
    { id: 'eco_no_gas_7', name: 'Gasolina control', category: 'economia_familia', subcategory: 'Economía', emoji: 'local_gas_station', tier: 2, description: '1 semana sin viajes por impulso.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_useful_1', name: 'Compra útil', category: 'economia_familia', subcategory: 'Economía', emoji: 'shopping_bag', tier: 1, description: '1 compra 100% útil.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_wardrobe_1', name: 'Armario I', category: 'economia_familia', subcategory: 'Economía', emoji: 'checkroom', tier: 2, description: '1 prenda que eleve tu estilo.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_wardrobe_3', name: 'Armario II', category: 'economia_familia', subcategory: 'Economía', emoji: 'style', tier: 3, description: '3 prendas bien elegidas.', requirement: { type: 'manual', count: 3 } },
    { id: 'eco_wallapop_pub_3', name: 'Wallapop I', category: 'economia_familia', subcategory: 'Economía', emoji: 'storefront', tier: 1, description: 'Publicar 3 anuncios.', requirement: { type: 'manual', count: 3 } },
    { id: 'eco_wallapop_sell_1', name: 'Wallapop II', category: 'economia_familia', subcategory: 'Economía', emoji: 'sell', tier: 2, description: 'Vender 1 cosa.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_wallapop_sell_3', name: 'Wallapop III', category: 'economia_familia', subcategory: 'Economía', emoji: 'monetization_on', tier: 3, description: 'Vender 3 cosas.', requirement: { type: 'manual', count: 3 } },
    { id: 'eco_solo_date', name: 'Cita contigo', category: 'economia_familia', subcategory: 'Economía', emoji: 'coffee', tier: 2, description: 'Ir 1 día solo a comer (planificado).', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_save_600', name: 'Ahorro I', category: 'economia_familia', subcategory: 'Economía', emoji: 'savings', tier: 1, description: 'Llegar a 600€.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_save_700', name: 'Ahorro II', category: 'economia_familia', subcategory: 'Economía', emoji: 'savings', tier: 2, description: 'Llegar a 700€.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_save_800', name: 'Ahorro III', category: 'economia_familia', subcategory: 'Economía', emoji: 'savings', tier: 3, description: 'Llegar a 800€.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_save_900', name: 'Ahorro IV', category: 'economia_familia', subcategory: 'Economía', emoji: 'account_balance', tier: 4, description: 'Llegar a 900€.', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_rec_1', name: 'Ingreso recurrente I', category: 'economia_familia', subcategory: 'Economía', emoji: 'currency_exchange', tier: 3, description: '50€/mes (aunque sea pequeño).', requirement: { type: 'manual', count: 1 } },
    { id: 'eco_rec_2', name: 'Ingreso recurrente II', category: 'economia_familia', subcategory: 'Economía', emoji: 'price_check', tier: 4, description: '2 meses con ingreso recurrente.', requirement: { type: 'manual', count: 2 } },
    { id: 'eco_pc_limit_7', name: 'PC protector', category: 'economia_familia', subcategory: 'Economía', emoji: 'videogame_asset_off', tier: 3, description: '7 días sin jugar entre semana.', requirement: { type: 'manual', count: 7 } },

    // Familia y amigos
    { id: 'fam_discord_1', name: 'Límite Discord I', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'headset_off', tier: 1, description: '1 semana cumpliendo tu límite.', requirement: { type: 'manual', count: 1 } },
    { id: 'fam_discord_3', name: 'Límite Discord II', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'phonelink_erase', tier: 3, description: '3 semanas cumpliendo límite.', requirement: { type: 'manual', count: 3 } },
    { id: 'fam_wa_7', name: 'WhatsApp control', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'speaker_notes_off', tier: 2, description: '7 días sin entrar por reflejo.', requirement: { type: 'manual', count: 7 } },
    { id: 'fam_home_5', name: 'Casa primero', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'cleaning_services', tier: 2, description: '5 tareas/ayudas en casa en 1 semana.', requirement: { type: 'manual', count: 5 } },
    { id: 'fam_gpa_1', name: 'Abuelo ritual', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'elderly', tier: 1, description: 'Visitar al abuelo (1 semana).', requirement: { type: 'manual', count: 1 } },
    { id: 'fam_gpa_4', name: 'Abuelo constante', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'diversity_1', tier: 4, description: '4 semanas visitando 1 vez/sem.', requirement: { type: 'manual', count: 4 } },
    { id: 'fam_gpa_advice', name: 'Pregunta sabia', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'psychology', tier: 2, description: 'Preguntar por su mejor consejo de vida.', requirement: { type: 'manual', count: 1 } },
    { id: 'fam_cool_3', name: 'Sangre fría I', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'ac_unit', tier: 2, description: '3 veces sin reaccionar a piques.', requirement: { type: 'manual', count: 3 } },
    { id: 'fam_cool_10', name: 'Sangre fría II', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'severe_cold', tier: 3, description: '10 veces sin reaccionar a piques.', requirement: { type: 'manual', count: 10 } },
    { id: 'fam_silent_5', name: 'Hablar después', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'volume_off', tier: 3, description: '5 veces que no cuentas planes hasta ejecutarlos.', requirement: { type: 'manual', count: 5 } },
    { id: 'fam_valentine', name: 'San Valentín', category: 'economia_familia', subcategory: 'Familia y Amigos', emoji: 'favorite', tier: 4, description: 'Medalla evento (Sushi + bombones).', requirement: { type: 'manual', count: 1 } },


    // --- SALUD / FITNESS ---
    { id: 'fit_back_1', name: 'Reenganche', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'fitness_center', tier: 1, description: '1 día de gimnasio.', requirement: { type: 'manual', count: 1 } },
    { id: 'fit_week_3', name: 'Semana 3', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'directions_run', tier: 1, description: '3 entrenos en 7 días.', requirement: { type: 'manual', count: 1 } },
    { id: 'fit_week_4', name: 'Semana 4', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'sports_gymnastics', tier: 2, description: '4 entrenos en 7 días.', requirement: { type: 'manual', count: 1 } },
    { id: 'fit_week_5', name: 'Semana 5', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'sports_martial_arts', tier: 3, description: '5 entrenos en 7 días.', requirement: { type: 'manual', count: 1 } },
    { id: 'fit_legs_4', name: 'Pierna sí o sí', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'airline_seat_legroom_extra', tier: 3, description: 'Día de pierna 4 semanas.', requirement: { type: 'manual', count: 4 } },
    { id: 'fit_run_5k', name: '5K', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'directions_run', tier: 3, description: 'Correr 5 km.', requirement: { type: 'manual', count: 1 } },
    { id: 'fit_walk_10k', name: 'Caminata 10K', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'directions_walk', tier: 2, description: '10 km andando en un día.', requirement: { type: 'manual', count: 1 } },
    { id: 'fit_bike_30', name: 'Bici 30', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'directions_bike', tier: 1, description: '30 min bici estática.', requirement: { type: 'manual', count: 1 } },
    { id: 'fit_bike_60', name: 'Bici 60', category: 'salud_habitos', subcategory: 'Fitness', emoji: 'pedal_bike', tier: 2, description: '1 hora bici estática.', requirement: { type: 'manual', count: 1 } },

    // Dieta / Cuerpo
    { id: 'diet_weight_1', name: 'Volver al peso', category: 'salud_habitos', subcategory: 'Dieta y Cuerpo', emoji: 'monitor_weight', tier: 1, description: 'Pesarte 1 vez y registrarlo.', requirement: { type: 'manual', count: 1 } },
    { id: 'diet_clean_5', name: 'Semana limpia', category: 'salud_habitos', subcategory: 'Dieta y Cuerpo', emoji: 'restaurant', tier: 2, description: '5/7 días cuidando comida.', requirement: { type: 'manual', count: 1 } },
    { id: 'diet_clean_7', name: 'Semana dieta full', category: 'salud_habitos', subcategory: 'Dieta y Cuerpo', emoji: 'ramen_dining', tier: 3, description: '7/7 días cuidando comida.', requirement: { type: 'manual', count: 1 } },
    { id: 'diet_minus_1kg', name: '-1 kg', category: 'salud_habitos', subcategory: 'Dieta y Cuerpo', emoji: 'trending_down', tier: 4, description: 'Bajar 1 kilo (resultado).', requirement: { type: 'manual', count: 1 } },
    { id: 'diet_water_3', name: 'Hidratación 3', category: 'salud_habitos', subcategory: 'Dieta y Cuerpo', emoji: 'water_drop', tier: 1, description: '2 litros/día en 3 días.', requirement: { type: 'manual', count: 3 } },
    { id: 'diet_water_7', name: 'Hidratación 7', category: 'salud_habitos', subcategory: 'Dieta y Cuerpo', emoji: 'invert_colors', tier: 2, description: '2 litros/día en 7 días.', requirement: { type: 'manual', count: 7 } },

    // Sueño
    { id: 'sleep_7am_3', name: 'Madrugador I', category: 'salud_habitos', subcategory: 'Sueño', emoji: 'wb_twilight', tier: 2, description: '7:00 AM x 3 días.', requirement: { type: 'manual', count: 3 } },
    { id: 'sleep_7am_7', name: 'Madrugador II', category: 'salud_habitos', subcategory: 'Sueño', emoji: 'sunny', tier: 3, description: '7:00 AM x 7 días.', requirement: { type: 'manual', count: 7 } },
    { id: 'sleep_perf_4', name: 'Sueño perfecto I', category: 'salud_habitos', subcategory: 'Sueño', emoji: 'bed', tier: 2, description: '4/7 días con buena rutina.', requirement: { type: 'manual', count: 1 } },
    { id: 'sleep_perf_7', name: 'Sueño perfecto II', category: 'salud_habitos', subcategory: 'Sueño', emoji: 'hotel', tier: 3, description: '7/7 días con buena rutina.', requirement: { type: 'manual', count: 1 } },

    // Cuidado/Cuerpo
    { id: 'care_face_7', name: 'Cara cuidada', category: 'salud_habitos', subcategory: 'Cuidado Personal', emoji: 'face', tier: 2, description: '7 días rutina facial mínima.', requirement: { type: 'manual', count: 7 } },
    { id: 'care_nail_3', name: 'Uñas I', category: 'salud_habitos', subcategory: 'Cuidado Personal', emoji: 'front_hand', tier: 1, description: '3 días sin morder uñas.', requirement: { type: 'manual', count: 3 } },
    { id: 'care_nail_7', name: 'Uñas II', category: 'salud_habitos', subcategory: 'Cuidado Personal', emoji: 'back_hand', tier: 2, description: '7 días sin morder uñas.', requirement: { type: 'manual', count: 7 } },
    { id: 'care_nail_21', name: 'Uñas III', category: 'salud_habitos', subcategory: 'Cuidado Personal', emoji: 'sign_language', tier: 4, description: '21 días sin morder uñas.', requirement: { type: 'manual', count: 21 } },

    // Médico & Organizativo
    { id: 'med_book', name: 'Revisión', category: 'salud_habitos', subcategory: 'Rutina y Salud', emoji: 'local_hospital', tier: 1, description: 'Pedir cita / gestionar revisión.', requirement: { type: 'manual', count: 1 } },
    { id: 'med_blood', name: 'Análisis de sangre', category: 'salud_habitos', subcategory: 'Rutina y Salud', emoji: 'bloodtype', tier: 2, description: 'Análisis hecho (evento).', requirement: { type: 'manual', count: 1 } },
    { id: 'med_follow_7', name: 'Seguimiento', category: 'salud_habitos', subcategory: 'Rutina y Salud', emoji: 'medical_services', tier: 2, description: 'Aplicar recomendación médica 7 días.', requirement: { type: 'manual', count: 7 } },
    { id: 'org_lang_wk', name: 'Días de idiomas', category: 'salud_habitos', subcategory: 'Rutina y Salud', emoji: 'edit_calendar', tier: 2, description: 'Definir 2-3 días fijos y cumplir 1 semana.', requirement: { type: 'manual', count: 1 } },
    { id: 'org_yt_wk', name: 'Rutina YouTube', category: 'salud_habitos', subcategory: 'Rutina y Salud', emoji: 'video_call', tier: 2, description: 'Definir ciclo guion/gra/edi y cumplir.', requirement: { type: 'manual', count: 1 } },
    { id: 'org_face_7', name: 'Entrenar la cara', category: 'salud_habitos', subcategory: 'Rutina y Salud', emoji: 'record_voice_over', tier: 3, description: '7 sesiones expresividad/cámara.', requirement: { type: 'manual', count: 7 } },


    // --- SECUNDARIAS ---
    { id: 'sec_sunrise', name: 'Amanecer', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'wb_sunny', tier: 2, description: 'Amanecer + caminar sin cascos.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_coffee', name: 'Café a solas', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'local_cafe', tier: 1, description: 'Invítate a un café (sin tlf).', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_stars', name: 'Estrellas', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'nights_stay', tier: 2, description: 'Aprender 10 constelaciones.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_letter', name: 'Carta secreta', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'mail', tier: 1, description: 'Escribe una carta que nunca enviarás.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_cook', name: 'Cocina global', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'soup_kitchen', tier: 2, description: 'Cocina un plato de un país nuevo.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_book', name: 'Lectura exterior', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'menu_book', tier: 1, description: 'Leer libro físico al aire libre.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_map', name: 'Cartógrafo', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'map', tier: 3, description: 'Mapa lugares favoritos del barrio.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_bread', name: 'Pan / Pasta', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'bakery_dining', tier: 2, description: 'Haz pan o pasta a mano.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_route', name: 'Ruta distinta', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'alt_route', tier: 1, description: 'Recorrer ruta a hora diferente.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_garden', name: 'Jardinero', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'potted_plant', tier: 2, description: 'Pequeño jardín de hierbas.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_draw', name: 'Dibujante', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'draw', tier: 1, description: 'Dibujar 20 min.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_flowers', name: 'Botánico', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'local_florist', tier: 1, description: 'Prensar hojas o flores.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_calli', name: 'Caligrafía', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'history_edu', tier: 2, description: 'Practicar 1 semana.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_playlist', name: 'Banda Sonora', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'queue_music', tier: 1, description: 'Playlist para esta temporada.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_journal', name: 'Observador', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'visibility', tier: 2, description: 'Diario en café observando.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_defense', name: 'Defensa', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'sports_martial_arts', tier: 1, description: 'Aprender movimiento defensa.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_stretch', name: 'Flexibilidad', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'accessibility', tier: 1, description: 'Estirar de forma nueva.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_museum', name: 'Cultura', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'museum', tier: 2, description: 'Visitar museo solo.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_compliment', name: 'Amabilidad', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'volunteer_activism', tier: 1, description: 'Cumplido sincero a desconocido.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_talk', name: 'Público', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'mic', tier: 3, description: 'Asistir charla o micrófono abierto.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_vol', name: 'Altruismo', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'handshake', tier: 3, description: 'Voluntariado 1 vez sin publicar.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_build', name: 'Carpintero', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'handyman', tier: 2, description: 'Construye algo con las manos.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_fix', name: 'Manitas', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'plumbing', tier: 2, description: 'Arregla algo en casa.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_movie', name: 'Cinéfilo', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'theaters', tier: 1, description: 'Película clásica entera.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_detox', name: 'Detox 24h', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'mobile_off', tier: 4, description: 'Desintoxicación RRSS 24h.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_photo', name: 'Fotógrafo', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'camera_alt', tier: 1, description: 'Fotografiar texturas.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_poem', name: 'Poesía', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'receipt_long', tier: 2, description: 'Memorizar un poema corto.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_sauce', name: 'Chef de salsas', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'blender', tier: 2, description: 'Aprender a preparar una salsa perfecta.', requirement: { type: 'manual', count: 1 } },
    { id: 'sec_silence', name: 'Silencio total', category: 'secundarias', subcategory: 'Misiones Varias', emoji: 'self_improvement', tier: 1, description: 'Sentarte en silencio durante 10 min.', requirement: { type: 'manual', count: 1 } },

    // --- COMODINES ---
    { id: 'wildcard_1', name: 'Plan mínimo hecho', category: 'general', subcategory: 'Generales', emoji: 'shield', tier: 1, description: 'Se truncó el día pero mantuviste constancia.', requirement: { type: 'manual', count: 1 } },
    { id: 'wildcard_2', name: 'Plan mínimo hecho II', category: 'general', subcategory: 'Generales', emoji: 'shield', tier: 2, description: 'Segundo rescate semanal.', requirement: { type: 'manual', count: 1 } },
];

export const ACHIEVEMENT_CATEGORIES = {
    youtube: { name: 'YouTube / Redes', color: '#FF6B6B' },
    aprendizaje: { name: 'Aprendizaje', color: '#60A5FA' },
    economia_familia: { name: 'Economía & Entorno', color: '#10B981' },
    salud_habitos: { name: 'Salud & Hábitos', color: '#F59E0B' },
    secundarias: { name: 'Misiones Secundarias', color: '#8B5CF6' },
    general: { name: 'Comodines', color: '#9CA3AF' } // For wildcards
};

// Count tasks or check progress based on backend store log (if we kept automated ones, but here all are manual)
export function checkAllAchievements() {
    const newlyUnlocked = [];

    for (const def of ACHIEVEMENT_DEFS) {
        const current = store.achievements[def.id];
        if (current?.unlocked) continue;

        let progress = 0;
        let total = def.requirement.count;
        let met = false;

        if (def.requirement.type === 'manual') {
            progress = store.achievements[def.id]?.progress || 0;
            met = progress >= total;
        }

        // Keep it bounded
        store.updateAchievementProgress(def.id, Math.min(progress, total));

        // Unlock if met
        if (met) {
            store.unlockAchievement(def.id, { progress: total });
            newlyUnlocked.push(def);
        }
    }

    // Show toasts for newly unlocked
    newlyUnlocked.forEach((ach, i) => {
        setTimeout(() => {
            showToast('achievement', `${ach.emoji} ${ach.name}`, ach.description);
            store.addActivity('achievement', `Medalla desbloqueada: ${ach.name}`, ach.emoji);
        }, i * 800);
    });

    return newlyUnlocked;
}

// Get achievement with its current state
export function getAchievementState(id) {
    const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
    if (!def) return null;

    const saved = store.achievements[id] || { unlocked: false, progress: 0 };
    return {
        ...def,
        ...saved,
        total: def.requirement.count,
        pct: Math.min(100, Math.round((saved.progress / def.requirement.count) * 100)),
        status: saved.unlocked ? 'completed' : saved.progress > 0 ? 'in-progress' : 'locked',
    };
}

export function incrementAchievement(id, amount = 1) {
    const state = getAchievementState(id);
    if (!state || state.status === 'completed') return;
    store.updateAchievementProgress(id, state.progress + amount);
    checkAllAchievements();
}

export function decrementAchievement(id, amount = 1) {
    const state = getAchievementState(id);
    if (!state) return;
    // can't decrement below 0 or below lock state if unlocked, wait... if it's completed we shouldn't decrement or maybe we allow it?
    // Let's just allow decrementing progress but not un-completing for now, or maybe yes.
    let newProg = Math.max(0, state.progress - amount);
    if (state.status === 'completed' && newProg < state.total) {
        // user reversed completion
        store.data.achievements[id].unlocked = false;
        store.data.achievements[id].progress = newProg;
        store.save();
    } else {
        store.updateAchievementProgress(id, newProg);
    }
}

// Register global checker
window.__checkAchievements = checkAllAchievements;
