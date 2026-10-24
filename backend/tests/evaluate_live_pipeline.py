"""
Recoza Live Recommendation Pipeline Evaluation Script
Computes empirical metrics across real benchmark query workloads:
  - Category Accuracy (%)
  - Image Consistency (%)
  - Explanation Coverage (%)
  - Duplicate Rate (%)
  - Average Latency (ms)
"""
import os
import sys
import time
import json

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engine.graph_engine import GraphEngine
from engine.ranking import RecommenderRanker
from engine.explainer import RecommendationExplainer
from engine.conversational_agent import ConversationalAgent
from engine.memory import UserMemory

def run_evaluation():
    data_dir = os.path.join(backend_dir, "data")
    engine = GraphEngine(data_dir)
    ranker = RecommenderRanker(engine)
    explainer = RecommendationExplainer(engine)
    agent = ConversationalAgent(engine, ranker, explainer)

    benchmark_queries = [
        {"query": "Recommend educational building toys for a 10-year-old", "expected_type": "toy", "feature": "building"},
        {"query": "Recommend beginner-friendly building games", "expected_type": "game", "feature": "building"},
        {"query": "Recommend cooperative family board games", "expected_type": "game", "feature": "board"},
        {"query": "STEM robotics and science kits for kids", "expected_type": "toy", "feature": "stem"},
        {"query": "Puzzles and family strategy board games", "expected_type": "game", "feature": "puzzle"},
        {"query": "LEGO architecture and building sets", "expected_type": "toy", "feature": "building"},
        {"query": "Card games and tabletop collectibles", "expected_type": "game", "feature": "card"},
        {"query": "Recommend science-fiction movies", "expected_type": "unsupported", "feature": "movie"}
    ]

    total_queries = len(benchmark_queries)
    category_matches = 0
    total_recs = 0
    duplicate_count = 0
    image_consistent_count = 0
    explanation_grounded_count = 0
    latencies = []

    print("=" * 70)
    print("RECOZA LIVE PIPELINE EVALUATION BENCHMARK")
    print("=" * 70)

    for idx, bq in enumerate(benchmark_queries, 1):
        mem = UserMemory(user_id=f"eval_user_{idx}")
        start_t = time.perf_counter()
        res = agent.process_message(bq["query"], mem, session_id=f"sess_{idx}")
        elapsed_ms = (time.perf_counter() - start_t) * 1000.0
        latencies.append(elapsed_ms)

        items = res["items"]
        total_recs += len(items)

        # 1. Category accuracy
        if bq["expected_type"] == "unsupported":
            if len(items) == 0 and res.get("unsupported_domain"):
                category_matches += 1
                cat_status = "PASS (0 items, refusal reported)"
            else:
                cat_status = "FAIL (returned items for unsupported domain)"
        elif bq["expected_type"] == "game":
            is_all_games = all(it.get("is_game") or any(w in it["title"].lower() for w in ['game', 'puzzle', 'card', 'board', 'tabletop']) for it in items)
            has_no_dolls = all(not any(b in it["title"].lower() for b in ['doll', 'truck', 'hot wheels', 'vehicle', 'plush']) for it in items)
            if is_all_games and has_no_dolls and len(items) > 0:
                category_matches += 1
                cat_status = f"PASS ({len(items)} games)"
            else:
                cat_status = "FAIL"
        elif bq["expected_type"] == "toy":
            is_all_toys = all(it.get("is_toy") and not any(b in it["title"].lower() for b in ['doll', 'truck', 'hot wheels', 'plush']) for it in items)
            if is_all_toys and len(items) > 0:
                category_matches += 1
                cat_status = f"PASS ({len(items)} toys)"
            else:
                cat_status = "FAIL"

        # 2. Check duplicates, images, explanations
        seen_asins = set()
        for it in items:
            asin = it["item_id"]
            if asin in seen_asins:
                duplicate_count += 1
            seen_asins.add(asin)

            # Image consistency check
            img = it.get("image_url", "")
            if img and img.startswith("http") and asin in img:
                image_consistent_count += 1

            # Explanation groundedness check
            exp = it.get("explanation", {})
            if exp.get("primary_reason") and exp.get("matching_attributes") and exp.get("graph_path"):
                explanation_grounded_count += 1

        print(f"[{idx}/{total_queries}] '{bq['query'][:40]}...' -> {cat_status} | {elapsed_ms:.2f} ms")

    cat_accuracy = (category_matches / total_queries) * 100.0
    dup_rate = (duplicate_count / max(1, total_recs)) * 100.0
    img_consistency = (image_consistent_count / max(1, total_recs)) * 100.0
    exp_coverage = (explanation_grounded_count / max(1, total_recs)) * 100.0
    avg_latency = sum(latencies) / len(latencies)

    print("=" * 70)
    print("EVALUATION RESULTS SUMMARY")
    print(f"Total Benchmark Workloads:      {total_queries}")
    print(f"Total Recommendations Produced: {total_recs}")
    print(f"Category Accuracy:              {cat_accuracy:.1f}%")
    print(f"Duplicate Recommendation Rate:  {dup_rate:.1f}%")
    print(f"Image-to-ASIN Consistency:      {img_consistency:.1f}%")
    print(f"Explanation Grounded Coverage:  {exp_coverage:.1f}%")
    print(f"Mean Pipeline Latency:          {avg_latency:.2f} ms")
    print("=" * 70)

if __name__ == '__main__':
    run_evaluation()
