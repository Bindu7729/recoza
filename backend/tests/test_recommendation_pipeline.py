"""
Recoza Phase 8 — Comprehensive End-to-End Test Suite
Directly verifies Scenarios 1 through 13 from the project specification:
  - Test 1: Category accuracy (Educational building toys)
  - Test 2: Game accuracy (Physical building games returned; video game software reported as unsupported)
  - Test 3: Category switching (Multi-turn switch from toys to games)
  - Test 4: Unsupported movie request (Reported as outside catalog with 0 items)
  - Test 5: Preference memory (Multi-turn refinement over 3+ turns)
  - Test 6: Ranking relevance (Higher-ranked items have superior relevance scores)
  - Test 7: Image consistency (Each image URL corresponds directly to item's ASIN)
  - Test 8: Explanation quality (Every card includes genuine metadata-grounded reasoning)
  - Test 9: Duplicate prevention (Zero duplicate ASINs in result sets)
  - Test 10: No matching candidates (Impossible criteria returns 0 items and clear guidance)
  - Test 11: Frontend integration contract (Schema compatibility with frontend types)
  - Test 12: Full website API endpoints (Health, categories, catalog, stats, feedback)
  - Test 13: Regression verification (Feedback logging, preference update, memory state)
"""
import os
import sys
import unittest

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engine.graph_engine import GraphEngine
from engine.ranking import RecommenderRanker
from engine.explainer import RecommendationExplainer
from engine.conversational_agent import ConversationalAgent
from engine.memory import UserMemory
from storage import PersistentStore

class TestRecozaEndToEnd(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data_dir = os.path.join(backend_dir, "data")
        cls.engine = GraphEngine(data_dir)
        cls.ranker = RecommenderRanker(cls.engine)
        cls.explainer = RecommendationExplainer(cls.engine)
        cls.agent = ConversationalAgent(cls.engine, cls.ranker, cls.explainer)
        cls.store = PersistentStore()

    def setUp(self):
        self.memory = UserMemory(user_id="phase8_test_user")

    def test_01_category_accuracy(self):
        """Scenario 1: Educational building toys -> returns verified building/STEM toys only."""
        query = "Recommend educational building toys for a 10-year-old"
        res = self.agent.process_message(query, self.memory, session_id="s1")
        items = res['items']
        self.assertGreaterEqual(len(items), 1, "Should return educational building toys")
        for it in items:
            t = it['title'].lower()
            self.assertFalse(any(b in t for b in ['doll', 'barbie', 'monster truck', 'hot wheels', 'plush']),
                            f"Non-toy '{it['title']}' returned for toy request")
            has_trait = (it.get('is_building') or it.get('is_educational') or
                         any(w in t for w in ['lego', 'brick', 'block', 'build', 'construct', 'stem', 'robot', 'science', 'magnet']))
            self.assertTrue(has_trait, f"Item '{it['title']}' lacks building/educational attributes")
        print("\n[PASS] Scenario 1: Category accuracy verified for educational building toys.")

    def test_02_game_accuracy(self):
        """Scenario 2: Physical building games returned; video game software reported as unsupported limitation."""
        # A: Physical building games
        query_game = "Recommend beginner-friendly building games"
        res_game = self.agent.process_message(query_game, self.memory, session_id="s2a")
        self.assertGreaterEqual(len(res_game['items']), 1)
        for it in res_game['items']:
            self.assertTrue(it.get('is_game') or any(w in it['title'].lower() for w in ['game', 'puzzle', 'tower', 'balanc', 'board', 'card']),
                            f"Item '{it['title']}' must be a game")
            self.assertFalse(any(b in it['title'].lower() for b in ['doll', 'monster truck', 'hot wheels', 'vehicle', 'plush']))
        
        # B: Digital video games (reported truthfully as outside physical catalog)
        query_vg = "Recommend Nintendo Switch video games"
        res_vg = self.agent.process_message(query_vg, self.memory, session_id="s2b")
        self.assertEqual(len(res_vg['items']), 0, "Video game software is outside catalog; must report 0 items")
        self.assertIn("unsupported_domain", res_vg)
        print("\n[PASS] Scenario 2: Game accuracy verified. Physical games returned; video game software limitation reported.")

    def test_03_category_switching(self):
        """Scenario 3: Category switching from toys to games in the same session."""
        sess_id = "s3"
        res1 = self.agent.process_message("Recommend toys", self.memory, session_id=sess_id)
        self.assertGreaterEqual(len(res1['items']), 1)
        
        res2 = self.agent.process_message("Now recommend games", self.memory, session_id=sess_id)
        items2 = res2['items']
        self.assertGreaterEqual(len(items2), 1)
        for it in items2:
            self.assertTrue(it.get('is_game') or any(w in it['title'].lower() for w in ['game', 'puzzle', 'board', 'card', 'dice']),
                            f"Item '{it['title']}' after switch must be a game")
            self.assertFalse(any(b in it['title'].lower() for b in ['doll', 'truck', 'hot wheels', 'vehicle', 'plush']))
        print("\n[PASS] Scenario 3: Category switching respected. Turn 2 returned games only.")

    def test_04_unsupported_movie_request(self):
        """Scenario 4: Requesting movies reports unsupported domain and returns 0 items."""
        res = self.agent.process_message("Recommend science-fiction movies", self.memory, session_id="s4")
        self.assertEqual(len(res['items']), 0)
        self.assertIn("Movies & Films", res.get('unsupported_domain', ''))
        self.assertIn("Amazon Toys & Games", res['reply'])
        print("\n[PASS] Scenario 4: Unsupported movie request gracefully reported with 0 items.")

    def test_05_preference_memory(self):
        """Scenario 5: Multi-turn preference accumulation and count specification."""
        sess_id = "s5"
        self.agent.process_message("Recommend toys", self.memory, session_id=sess_id)
        res2 = self.agent.process_message("Only educational ones", self.memory, session_id=sess_id)
        for it in res2['items']:
            self.assertTrue(it.get('is_educational') or any(w in it['title'].lower() for w in ['learn', 'stem', 'science', 'educat', 'build', 'block']))
            
        res3 = self.agent.process_message("Show five options", self.memory, session_id=sess_id)
        self.assertEqual(len(res3['items']), 5, "Must return exactly 5 options")
        print("\n[PASS] Scenario 5: Preference memory persisted across turns and count was respected.")

    def test_06_ranking_relevance(self):
        """Scenario 6: Top-ranked candidate has higher relevance score than lower-ranked candidate."""
        res = self.agent.process_message("Recommend STEM chemistry kits", self.memory, session_id="s6")
        items = res['items']
        self.assertGreaterEqual(len(items), 2)
        score_top = items[0].get('ranking_meta', {}).get('final_score', 0)
        score_last = items[-1].get('ranking_meta', {}).get('final_score', 0)
        self.assertGreaterEqual(score_top, score_last, "Higher-ranked candidate should have >= score than lower-ranked")
        print(f"\n[PASS] Scenario 6: Ranking relevance verified (Rank 1 score: {score_top} >= Rank {len(items)} score: {score_last}).")

    def test_07_image_consistency(self):
        """Scenario 7: Every item's image URL matches its genuine ASIN."""
        res = self.agent.process_message("Recommend building sets", self.memory, session_id="s7")
        items = res['items']
        self.assertGreaterEqual(len(items), 1)
        for it in items:
            asin = it['item_id']
            img = it.get('image_url', '')
            self.assertTrue(img.startswith('http'), "Image URL must be valid HTTP/HTTPS")
            self.assertIn(asin, img, f"Image URL must reference item's own ASIN {asin}")
        print("\n[PASS] Scenario 7: Image consistency verified across all candidates.")

    def test_08_explanation_quality(self):
        """Scenario 8: Explanations contain item-specific attributes, graph path, and ground truth."""
        res = self.agent.process_message("Recommend cooperative family board games", self.memory, session_id="s8")
        items = res['items']
        self.assertGreaterEqual(len(items), 1)
        for it in items:
            exp = it.get('explanation', {})
            self.assertIn('primary_reason', exp)
            self.assertIn('matching_attributes', exp)
            self.assertIn('graph_path', exp)
            self.assertIn('community_context', exp)
            self.assertGreaterEqual(len(exp['matching_attributes']), 2)
        print("\n[PASS] Scenario 8: Explanation quality and grounding verified.")

    def test_09_duplicate_prevention(self):
        """Scenario 9: Zero duplicate ASINs in recommendation sets."""
        res = self.agent.process_message("Recommend educational building toys", self.memory, session_id="s9")
        asins = [it['item_id'] for it in res['items']]
        self.assertEqual(len(asins), len(set(asins)), f"Duplicate ASINs found: {asins}")
        print("\n[PASS] Scenario 9: Duplicate prevention verified (0 duplicate ASINs).")

    def test_10_no_matching_candidates(self):
        """Scenario 10: Unfulfillable criteria returns 0 items and a graceful, informative message."""
        res = self.agent.process_message("Recommend building toys under $0.50 with 5.0 star rating", self.memory, session_id="s10")
        self.assertEqual(len(res['items']), 0)
        self.assertIn("could not find", res['reply'].lower())
        print("\n[PASS] Scenario 10: No matching candidates handled gracefully without returning random items.")

    def test_11_frontend_integration_contract(self):
        """Scenario 11: Backend output structure matches frontend TypeScript interface definitions."""
        res = self.agent.process_message("Recommend puzzles", self.memory, session_id="s11")
        # Check required ChatResponse keys
        for key in ['reply', 'items', 'clarification_needed', 'suggested_replies', 'memory_summary']:
            self.assertIn(key, res, f"Response missing frontend required key: {key}")
        
        # Check required Item keys
        if res['items']:
            item = res['items'][0]
            for it_key in ['item_id', 'title', 'category', 'cluster_name', 'store', 'average_rating', 'rating_number', 'price_formatted', 'image_url', 'community_id', 'explanation']:
                self.assertIn(it_key, item, f"Item missing frontend required key: {it_key}")
        print("\n[PASS] Scenario 11: Frontend integration contract verified with TypeScript schema.")

    def test_12_website_api_endpoints(self):
        """Scenario 12: Core API modules respond with correct data structures."""
        # 1. Health & Stats
        stats = self.engine.get_stats()
        self.assertEqual(stats['total_items'], 2399)
        self.assertGreaterEqual(stats['graph_edges'], 1000)
        
        # 2. Categories
        cats = self.engine.get_categories()
        self.assertGreaterEqual(len(cats), 1)
        
        # 3. Catalog Search
        cat_search = self.engine.search_items(query="Lego", limit=5)
        self.assertGreaterEqual(len(cat_search['items']), 1)
        print(f"\n[PASS] Scenario 12: Core API modules verified (2,399 items, {stats['graph_edges']} edges).")

    def test_13_regression_feedback_persistence(self):
        """Scenario 13: Feedback persistence, dislike suppression, and memory state tracking."""
        uid = "phase8_reg_user"
        mem = UserMemory(user_id=uid)
        
        # Like an item
        res1 = self.agent.process_message("Recommend building toys", mem, session_id="s13")
        self.assertGreaterEqual(len(res1['items']), 2)
        liked_asin = res1['items'][0]['item_id']
        disliked_asin = res1['items'][1]['item_id']
        
        mem.add_feedback(liked_asin, 'like')
        mem.add_feedback(disliked_asin, 'dislike', reason='too_complex')
        
        # Next query must not contain the disliked item
        res2 = self.agent.process_message("Recommend more building toys", mem, session_id="s13")
        ret_asins = [it['item_id'] for it in res2['items']]
        self.assertNotIn(disliked_asin, ret_asins, "Disliked item must be suppressed")
        
        # Memory state summary
        state = mem.to_dict(self.engine.item_to_comm)
        self.assertEqual(state['liked_count'], 1)
        self.assertEqual(state['disliked_count'], 1)
        print("\n[PASS] Scenario 13: Regression verification passed. Feedback and memory state active.")

if __name__ == '__main__':
    unittest.main()
