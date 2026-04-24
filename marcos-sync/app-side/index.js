import { BaseSideService } from '@zeppos/zml/base-side';

AppSideService(BaseSideService({
    onInit() {
        console.log('[Side] --- Service Initialized ---')
    },

    onRequest(req, res) {
        console.log(`[Side] Incoming request: ${req.method}`);

        if (req.method === 'sync_data') {
            const steps = req.params.steps || 0;
            const sleepScore = req.params.sleepScore || 0;
            const calories = req.params.calories || 0;

            const PC_IP = '192.168.0.27';
            const PORT = '3000';

            console.log(`[Side] DATA RECEIVED: Steps=${steps}, Sleep=${sleepScore}, Calories=${calories}`);

            // Respond instantly to watch
            res(null, { status: 'ok', received: { steps, sleepScore, calories } });

            // Background fetch
            console.log(`[Side] Forwarding to: http://${PC_IP}:${PORT}/api/zepp/sync`);

            fetch(`http://${PC_IP}:${PORT}/api/zepp/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    steps: steps,
                    calories: calories,
                    sleepScore: sleepScore
                })
            })
                .then(response => {
                    console.log(`[Side] Fetch SUCCESS. Status: ${response.status}`);
                })
                .catch(err => {
                    console.error(`[Side] Fetch FAILED: ${err.message}`);
                });
        }
    }
}))
